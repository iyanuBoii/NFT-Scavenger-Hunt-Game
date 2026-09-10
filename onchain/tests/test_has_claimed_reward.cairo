use onchain::interface::{IScavengerHuntDispatcher, IScavengerHuntDispatcherTrait, Levels};
use onchain::contracts::scavenger_hunt_nft::{
    IScavengerHuntNFTDispatcher, IScavengerHuntNFTDispatcherTrait,
};
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_caller_address,
    stop_cheat_caller_address,
};
use core::serde::Serde;
use starknet::{ContractAddress, contract_address_const};

// Regression tests for #618: ScavengerHunt should expose a getter reporting
// whether a player has already claimed (minted) the reward for a level.

fn ADMIN() -> ContractAddress {
    contract_address_const::<'ADMIN'>()
}

fn deploy_contract() -> ContractAddress {
    let contract = declare("ScavengerHunt").unwrap().contract_class();
    let mut constructor_calldata: Array<felt252> = array![];
    Serde::serialize(@ADMIN(), ref constructor_calldata);
    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();
    contract_address
}

fn deploy_scavenger_hunt_nft(
    token_uri: ByteArray, scavenger_hunt_address: ContractAddress,
) -> ContractAddress {
    let declare_result = declare("ScavengerHuntNFT").unwrap();
    let contract_class = declare_result.contract_class();
    let mut constructor_args: Array<felt252> = array![];
    token_uri.serialize(ref constructor_args);
    constructor_args.append(scavenger_hunt_address.into());

    let (address, _) = contract_class.deploy(@constructor_args).unwrap();
    address
}

fn setup_all_contracts() -> (
    IScavengerHuntDispatcher, IScavengerHuntNFTDispatcher, ContractAddress,
) {
    let hunt_address = deploy_contract();
    let hunt_dispatcher = IScavengerHuntDispatcher { contract_address: hunt_address };

    let token_uri_bytes: ByteArray = "ipfs://placeholder_uri/";
    let nft_address = deploy_scavenger_hunt_nft(token_uri_bytes, hunt_address);
    let nft_dispatcher = IScavengerHuntNFTDispatcher { contract_address: nft_address };

    let receiver_contract_class = declare("MockERC1155Receiver").unwrap().contract_class();
    let (receiver_address, _) = receiver_contract_class.deploy(@array![]).unwrap();

    start_cheat_caller_address(hunt_address, ADMIN());
    hunt_dispatcher.set_nft_contract_address(nft_address);
    stop_cheat_caller_address(hunt_address);

    (hunt_dispatcher, nft_dispatcher, receiver_address)
}

#[test]
fn test_has_claimed_reward_false_before_completion() {
    let (hunt_dispatcher, _nft_dispatcher, receiver_address) = setup_all_contracts();
    let player = receiver_address;

    assert!(
        !hunt_dispatcher.has_claimed_reward(player, Levels::Easy),
        "should not be claimed before completion",
    );
}

#[test]
fn test_has_claimed_reward_true_after_claim() {
    let (hunt_dispatcher, _nft_dispatcher, receiver_address) = setup_all_contracts();
    let hunt_address = hunt_dispatcher.contract_address;
    let player = receiver_address;
    let level = Levels::Easy;
    let question_id = 1;
    let correct_answer: ByteArray = "A";
    let question: ByteArray = "Q?";
    let hint: ByteArray = "Hint";

    start_cheat_caller_address(hunt_address, ADMIN());
    hunt_dispatcher.set_question_per_level(1);
    hunt_dispatcher.add_question(level, question, correct_answer.clone(), hint);
    stop_cheat_caller_address(hunt_address);

    start_cheat_caller_address(hunt_address, player);
    assert!(hunt_dispatcher.submit_answer(question_id, correct_answer), "answer should be correct");
    assert!(
        !hunt_dispatcher.has_claimed_reward(player, level),
        "should not be claimed before claiming the NFT",
    );

    hunt_dispatcher.claim_level_completion_nft(level);
    stop_cheat_caller_address(hunt_address);

    assert!(
        hunt_dispatcher.has_claimed_reward(player, level),
        "should be claimed after claiming the NFT",
    );
}

#[test]
fn test_has_claimed_reward_is_per_level() {
    let (hunt_dispatcher, _nft_dispatcher, receiver_address) = setup_all_contracts();
    let player = receiver_address;

    assert!(!hunt_dispatcher.has_claimed_reward(player, Levels::Easy), "easy not claimed");
    assert!(!hunt_dispatcher.has_claimed_reward(player, Levels::Medium), "medium not claimed");
    assert!(!hunt_dispatcher.has_claimed_reward(player, Levels::Hard), "hard not claimed");
    assert!(!hunt_dispatcher.has_claimed_reward(player, Levels::Master), "master not claimed");
}
