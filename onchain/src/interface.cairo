use starknet::ContractAddress;

#[starknet::interface]
pub trait IScavengerHunt<TContractState> {
    fn add_question(
        ref self: TContractState,
        level: Levels,
        question: ByteArray,
        answer: ByteArray,
        hint: ByteArray,
    );
    fn get_question(self: @TContractState, question_id: u64) -> Question;
    fn set_question_per_level(ref self: TContractState, amount: u8);
    fn get_question_per_level(self: @TContractState) -> u8;
    fn submit_answer(ref self: TContractState, question_id: u64, answer: ByteArray) -> bool;
    fn request_hint(
        ref self: TContractState, question_id: u64,
    ) -> ByteArray; // request hint for a question
    fn get_question_in_level(self: @TContractState, level: Levels, index: u8) -> ByteArray;
    fn update_question(
        ref self: TContractState,
        question_id: u64,
        question: ByteArray,
        answer: ByteArray,
        level: Levels,
        hint: ByteArray,
    );
    fn next_level(self: @TContractState, level: Levels) -> Levels;
    fn get_player_level(self: @TContractState, player: ContractAddress) -> Levels;
    fn set_nft_contract_address(ref self: TContractState, new_address: ContractAddress);
    fn get_nft_contract_address(self: @TContractState) -> ContractAddress;
    fn claim_level_completion_nft(ref self: TContractState, level: Levels);
    fn get_player_level_progress(
        self: @TContractState, player: ContractAddress, level: Levels
    ) -> LevelProgress;
    /// Returns whether `player` has already claimed (minted) the reward NFT for `level`.
    fn has_claimed_reward(self: @TContractState, player: ContractAddress, level: Levels) -> bool;
}

#[derive(Drop, Debug, Serde, starknet::Store)]
pub struct Question {
    pub question_id: u64,
    pub question: ByteArray,
    pub hashed_answer: felt252,
    pub level: Levels,
    pub hint: ByteArray,
}

#[derive(Drop, Debug, Copy, Serde, PartialEq, starknet::Store)]
pub enum Levels {
    #[default]
    Easy,
    Medium,
    Hard,
    Master,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
pub struct PlayerProgress {
    pub address: ContractAddress,
    pub current_level: Levels,
    pub is_initialized: bool,
}

#[derive(Drop, Serde, starknet::Store)]
pub struct LevelProgress {
    pub player: ContractAddress,
    pub level: Levels,
    pub last_question_index: u8, // Index of the last correctly answered question in a level
    pub is_completed: bool,
    pub attempts: u32,
    pub nft_minted: bool,
}

impl LevelsIntoFelt252 of Into<Levels, felt252> {
    fn into(self: Levels) -> felt252 {
        match self {
            Levels::Easy => 'EASY',
            Levels::Medium => 'MEDIUM',
            Levels::Hard => 'HARD',
            Levels::Master => 'MASTER',
        }
    }
}

impl Felt252TryIntoLevels of TryInto<felt252, Levels> {
    fn try_into(self: felt252) -> Option<Levels> {
        if self == 'EASY' {
            Option::Some(Levels::Easy)
        } else if self == 'MEDIUM' {
            Option::Some(Levels::Medium)
        } else if self == 'HARD' {
            Option::Some(Levels::Hard)
        } else if self == 'MASTER' {
            Option::Some(Levels::Master)
        } else {
            Option::None
        }
    }
}


impl LevelsIntoTokenIDs of Into<Levels, u256> {
    fn into(self: Levels) -> u256 {
        match self {
            Levels::Easy => 1,
            Levels::Medium => 2,
            Levels::Hard => 3,
            Levels::Master => 4,
        }
    }
}

impl TokenIDsTryIntoLevels of TryInto<u256, Levels> {
    fn try_into(self: u256) -> Option<Levels> {
        if self == 1 {
            Option::Some(Levels::Easy)
        } else if self == 2 {
            Option::Some(Levels::Medium)
        } else if self == 3 {
            Option::Some(Levels::Hard)
        } else if self == 'MASTER' {
            Option::Some(Levels::Master)
        } else {
            Option::None
        }
    }
}
