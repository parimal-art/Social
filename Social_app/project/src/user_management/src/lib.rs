use candid::{CandidType, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub principal: Principal,
    pub username: String,
    pub display_name: String,
    pub bio: String,
    pub avatar_url: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub is_verified: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreateUserRequest {
    pub username: String,
    pub display_name: String,
    pub bio: String,
    pub avatar_url: String,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdateUserRequest {
    pub display_name: Option<String>,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    static USERS: RefCell<StableBTreeMap<Principal, UserProfile, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
    
    static USERNAMES: RefCell<StableBTreeMap<String, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
}

#[update]
fn create_user(request: CreateUserRequest) -> Result<UserProfile, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot create profiles".to_string());
    }
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        if users.contains_key(&caller) {
            return Err("User already exists".to_string());
        }
        
        USERNAMES.with(|usernames| {
            let mut usernames = usernames.borrow_mut();
            
            if usernames.contains_key(&request.username) {
                return Err("Username already taken".to_string());
            }
            
            let now = time();
            let user = UserProfile {
                principal: caller,
                username: request.username.clone(),
                display_name: request.display_name,
                bio: request.bio,
                avatar_url: request.avatar_url,
                created_at: now,
                updated_at: now,
                is_verified: false,
            };
            
            users.insert(caller, user.clone());
            usernames.insert(request.username, caller);
            
            Ok(user)
        })
    })
}

#[update]
fn update_user(request: UpdateUserRequest) -> Result<UserProfile, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot update profiles".to_string());
    }
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        match users.get(&caller) {
            Some(mut user) => {
                if let Some(display_name) = request.display_name {
                    user.display_name = display_name;
                }
                if let Some(bio) = request.bio {
                    user.bio = bio;
                }
                if let Some(avatar_url) = request.avatar_url {
                    user.avatar_url = avatar_url;
                }
                user.updated_at = time();
                
                users.insert(caller, user.clone());
                Ok(user)
            }
            None => Err("User not found".to_string()),
        }
    })
}

#[query]
fn get_user(principal: Principal) -> Result<UserProfile, String> {
    USERS.with(|users| {
        let users = users.borrow();
        match users.get(&principal) {
            Some(user) => Ok(user.clone()),
            None => Err("User not found".to_string()),
        }
    })
}

#[query]
fn get_user_by_username(username: String) -> Result<UserProfile, String> {
    USERNAMES.with(|usernames| {
        let usernames = usernames.borrow();
        match usernames.get(&username) {
            Some(principal) => get_user(principal),
            None => Err("User not found".to_string()),
        }
    })
}

#[query]
fn get_current_user() -> Result<UserProfile, String> {
    let caller = ic_cdk::caller();
    get_user(caller)
}

#[query]
fn username_available(username: String) -> bool {
    USERNAMES.with(|usernames| {
        let usernames = usernames.borrow();
        !usernames.contains_key(&username)
    })
}

#[query]
fn get_all_users() -> Vec<UserProfile> {
    USERS.with(|users| {
        let users = users.borrow();
        users.iter().map(|(_, user)| user.clone()).collect()
    })
}

ic_cdk::export_candid!();