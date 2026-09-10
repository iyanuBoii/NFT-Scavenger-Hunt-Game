use onchain::contracts::scavenger_hunt_nft::{
    IScavengerHuntNFTDispatcher, IScavengerHuntNFTDispatcherTrait,
};
use onchain::contracts::scavenger_hunt_nft::ScavengerHuntNFT;
use onchain::contracts::scavenger_hunt_nft::ScavengerHuntNFT::{BadgeMinted, Event as NFTEvent};
use onchain::interface::Levels;
use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, spy_events, start_cheat_caller_address,
    stop_cheat_caller_address, EventSpyAssertionsTrait,
};
use starknet::ContractAddress;

// Regression tests for #614: ScavengerHuntNFT should emit a BadgeMinted
// event whenever a level badge is minted.

fn deploy_contract(scavenger_hunt_contract: ContractAddress) -> ContractAddress {
    let base_uri: ByteArray = "https://scavenger_hunt_nft.com/";

    let mut constructor_calldata: Array<felt252> = ArrayTrait::new();

    base_uri.serialize(ref constructor_calldata);
    constructor_calldata.append(scavenger_hunt_contract.into());

    let contract = declare("ScavengerHuntNFT").unwrap().contract_class();

    let (contract_address, _) = contract.deploy(@constructor_calldata).unwrap();

    contract_address
}

fn deploy_mock_receiver() -> ContractAddress {
    let contract = declare("MockERC1155Receiver").unwrap().contract_class();
    let (contract_address, _) = contract.deploy(@ArrayTrait::new()).unwrap();

    contract_address
}

#[test]
fn test_mint_emits_badge_minted_event() {
    let scavenger_hunt_address: ContractAddress = 0x456.try_into().unwrap();

    let contract_address = deploy_contract(scavenger_hunt_address);
    let scavenger_hunt = IScavengerHuntNFTDispatcher { contract_address };

    let recipient = deploy_mock_receiver();
    let level = Levels::Easy;
    let expected_token_id: u256 = level.into();

    let mut spy = spy_events();

    start_cheat_caller_address(contract_address, scavenger_hunt_address);
    scavenger_hunt.mint_level_badge(recipient, level);
    stop_cheat_caller_address(contract_address);

    spy
        .assert_emitted(
            @array![
                (
                    contract_address,
                    NFTEvent::BadgeMinted(
                        BadgeMinted { recipient, level, token_id: expected_token_id },
                    ),
                ),
            ],
        );
}

#[test]
fn test_minting_two_levels_emits_one_event_each() {
    let scavenger_hunt_address: ContractAddress = 0x456.try_into().unwrap();

    let contract_address = deploy_contract(scavenger_hunt_address);
    let scavenger_hunt = IScavengerHuntNFTDispatcher { contract_address };

    let recipient = deploy_mock_receiver();

    let mut spy = spy_events();

    start_cheat_caller_address(contract_address, scavenger_hunt_address);
    scavenger_hunt.mint_level_badge(recipient, Levels::Easy);
    scavenger_hunt.mint_level_badge(recipient, Levels::Medium);
    stop_cheat_caller_address(contract_address);

    let easy_token_id: u256 = Levels::Easy.into();
    let medium_token_id: u256 = Levels::Medium.into();

    spy
        .assert_emitted(
            @array![
                (
                    contract_address,
                    NFTEvent::BadgeMinted(
                        BadgeMinted { recipient, level: Levels::Easy, token_id: easy_token_id },
                    ),
                ),
                (
                    contract_address,
                    NFTEvent::BadgeMinted(
                        BadgeMinted { recipient, level: Levels::Medium, token_id: medium_token_id },
                    ),
                ),
            ],
        );
}
