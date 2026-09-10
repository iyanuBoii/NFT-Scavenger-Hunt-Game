use onchain::interface::Levels;
use starknet::ContractAddress;

#[starknet::interface]
pub trait IScavengerHuntNFT<TContractState> {
    /// Mints exactly one badge token for `level` to `recipient`.
    /// Caller must hold `MINTER_ROLE`. Panics if `recipient` already owns this badge.
    fn mint_level_badge(ref self: TContractState, recipient: ContractAddress, level: Levels);
    /// Returns whether `owner` holds the badge for `level`.
    fn has_level_badge(self: @TContractState, owner: ContractAddress, level: Levels) -> bool;

    // Access control functions
    /// Grants `MINTER_ROLE` to `account`. Caller must hold `DEFAULT_ADMIN_ROLE`.
    fn grant_minter_role(ref self: TContractState, account: ContractAddress);
    /// Revokes `MINTER_ROLE` from `account`. Caller must hold `DEFAULT_ADMIN_ROLE`.
    fn revoke_minter_role(ref self: TContractState, account: ContractAddress);
    /// Returns whether `account` holds `MINTER_ROLE`.
    fn has_minter_role(self: @TContractState, account: ContractAddress) -> bool;
}

#[starknet::contract]
pub mod ScavengerHuntNFT {
    use AccessControlComponent::InternalTrait;
    use core::felt252;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};
    use starknet::event::EventEmitter;
    use starknet::ContractAddress;
    use super::Levels;

    // Define role constants
    const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
    const DEFAULT_ADMIN_ROLE: felt252 = 0; // This is OZ's default admin role

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        #[flat]
        ERC1155Event: ERC1155Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        BadgeMinted: BadgeMinted,
    }

    /// Emitted whenever a level badge is minted to a recipient.
    #[derive(Drop, starknet::Event)]
    pub struct BadgeMinted {
        pub recipient: ContractAddress,
        pub level: Levels,
        pub token_id: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState, token_uri: ByteArray, scavenger_hunt_contract: ContractAddress,
    ) {
        // Initialize ERC-1155 with metadata URI
        self.erc1155.initializer(token_uri);

        // Initialize AccessControl
        self.accesscontrol.initializer();

        // Get deployer address
        let deployer = starknet::get_caller_address();

        // Grant default admin role to deployer
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, deployer);

        // Grant minter role to the Scavenger Hunt contract
        self.accesscontrol._grant_role(MINTER_ROLE, scavenger_hunt_contract);

        // Also grant default admin role to the Scavenger Hunt contract for testing purposes
        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, scavenger_hunt_contract);
    }

    // AccessControl implementation
    #[abi(embed_v0)]
    impl AccessControlImpl =
        AccessControlComponent::AccessControlImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    // ERC1155 implementation
    #[abi(embed_v0)]
    impl ERC1155Impl = ERC1155Component::ERC1155MixinImpl<ContractState>;
    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl ScavengerHuntNFTImpl of super::IScavengerHuntNFT<ContractState> {
        // Mint a level badge (exactly one token)
        fn mint_level_badge(ref self: ContractState, recipient: ContractAddress, level: Levels) {
            // Check that caller has minter role
            self.accesscontrol.assert_only_role(MINTER_ROLE);

            // Get token ID for the specified level
            let token_id = level.into();

            // Check if recipient already has this badge
            let balance = self.erc1155.balance_of(recipient, token_id);
            assert(balance == 0_u256, 'Already has this badge');

            // Mint exactly one token
            self.erc1155.mint_with_acceptance_check(recipient, token_id, 1_u256, array![].span());

            // Emit a domain event recording the mint
            self.emit(BadgeMinted { recipient, level, token_id });
        }

        // Check if a player has a specific level badge
        fn has_level_badge(self: @ContractState, owner: ContractAddress, level: Levels) -> bool {
            let token_id = level.into();
            let balance = self.erc1155.balance_of(owner, token_id);
            balance > 0_u256
        }

        // Grant minter role to a contract or address
        fn grant_minter_role(ref self: ContractState, account: ContractAddress) {
            // Check that caller has the default admin role
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);

            // Grant the role
            self.accesscontrol.grant_role(MINTER_ROLE, account);
        }

        // Revoke minter role from a contract or address
        fn revoke_minter_role(ref self: ContractState, account: ContractAddress) {
            // Check that caller has the default admin role
            self.accesscontrol.assert_only_role(DEFAULT_ADMIN_ROLE);

            // Revoke the role
            self.accesscontrol.revoke_role(MINTER_ROLE, account);
        }

        // Check if an account has minter role
        fn has_minter_role(self: @ContractState, account: ContractAddress) -> bool {
            self.accesscontrol.has_role(MINTER_ROLE, account)
        }
    }
}
