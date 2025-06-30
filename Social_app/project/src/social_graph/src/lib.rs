use candid::{CandidType, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Follow {
    pub follower: Principal,
    pub following: Principal,
    pub created_at: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct SocialStats {
    pub followers_count: u64,
    pub following_count: u64,
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    static FOLLOWS: RefCell<StableBTreeMap<String, Follow, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
    
    static FOLLOWERS: RefCell<StableBTreeMap<Principal, Vec<Principal>, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
    
    static FOLLOWING: RefCell<StableBTreeMap<Principal, Vec<Principal>, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(2)))
        )
    );
}

fn follow_key(follower: Principal, following: Principal) -> String {
    format!("{}#{}", follower.to_string(), following.to_string())
}

#[update]
fn follow_user(following: Principal) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot follow others".to_string());
    }
    
    if caller == following {
        return Err("You cannot follow yourself".to_string());
    }
    
    let key = follow_key(caller, following);
    
    FOLLOWS.with(|follows| {
        let mut follows = follows.borrow_mut();
        
        if follows.contains_key(&key) {
            return Err("Already following this user".to_string());
        }
        
        let follow = Follow {
            follower: caller,
            following,
            created_at: time(),
        };
        
        follows.insert(key, follow);
        
        // Update followers list
        FOLLOWERS.with(|followers| {
            let mut followers = followers.borrow_mut();
            let mut follower_list = followers.get(&following).unwrap_or_default();
            follower_list.push(caller);
            followers.insert(following, follower_list);
        });
        
        // Update following list
        FOLLOWING.with(|following_map| {
            let mut following_map = following_map.borrow_mut();
            let mut following_list = following_map.get(&caller).unwrap_or_default();
            following_list.push(following);
            following_map.insert(caller, following_list);
        });
        
        Ok(())
    })
}

#[update]
fn unfollow_user(following: Principal) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot unfollow others".to_string());
    }
    
    let key = follow_key(caller, following);
    
    FOLLOWS.with(|follows| {
        let mut follows = follows.borrow_mut();
        
        if !follows.contains_key(&key) {
            return Err("Not following this user".to_string());
        }
        
        follows.remove(&key);
        
        // Update followers list
        FOLLOWERS.with(|followers| {
            let mut followers = followers.borrow_mut();
            if let Some(mut follower_list) = followers.get(&following) {
                follower_list.retain(|&x| x != caller);
                followers.insert(following, follower_list);
            }
        });
        
        // Update following list
        FOLLOWING.with(|following_map| {
            let mut following_map = following_map.borrow_mut();
            if let Some(mut following_list) = following_map.get(&caller) {
                following_list.retain(|&x| x != following);
                following_map.insert(caller, following_list);
            }
        });
        
        Ok(())
    })
}

#[query]
fn is_following(follower: Principal, following: Principal) -> bool {
    let key = follow_key(follower, following);
    FOLLOWS.with(|follows| {
        let follows = follows.borrow();
        follows.contains_key(&key)
    })
}

#[query]
fn get_followers(user: Principal) -> Vec<Principal> {
    FOLLOWERS.with(|followers| {
        let followers = followers.borrow();
        followers.get(&user).unwrap_or_default()
    })
}

#[query]
fn get_following(user: Principal) -> Vec<Principal> {
    FOLLOWING.with(|following| {
        let following = following.borrow();
        following.get(&user).unwrap_or_default()
    })
}

#[query]
fn get_social_stats(user: Principal) -> SocialStats {
    let followers_count = get_followers(user).len() as u64;
    let following_count = get_following(user).len() as u64;
    
    SocialStats {
        followers_count,
        following_count,
    }
}

#[query]
fn get_mutual_followers(user1: Principal, user2: Principal) -> Vec<Principal> {
    let followers1 = get_followers(user1);
    let followers2 = get_followers(user2);
    
    followers1
        .into_iter()
        .filter(|follower| followers2.contains(follower))
        .collect()
}

#[query]
fn get_follow_suggestions(user: Principal, limit: u64) -> Vec<Principal> {
    let following = get_following(user);
    let mut suggestions = Vec::new();
    
    // Get followers of people you follow (friends of friends)
    for followed_user in following.iter() {
        let their_following = get_following(*followed_user);
        for suggestion in their_following {
            if suggestion != user && !following.contains(&suggestion) && !suggestions.contains(&suggestion) {
                suggestions.push(suggestion);
                if suggestions.len() >= limit as usize {
                    break;
                }
            }
        }
        if suggestions.len() >= limit as usize {
            break;
        }
    }
    
    suggestions
}

ic_cdk::export_candid!();