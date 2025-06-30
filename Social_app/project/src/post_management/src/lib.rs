use candid::{CandidType, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::BTreeMap;

type Memory = VirtualMemory<DefaultMemoryImpl>;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct Post {
    pub id: u64,
    pub author: Principal,
    pub content: String,
    pub media_urls: Vec<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub likes: Vec<Principal>,
    pub like_count: u64,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct CreatePostRequest {
    pub content: String,
    pub media_urls: Vec<String>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct UpdatePostRequest {
    pub content: Option<String>,
    pub media_urls: Option<Vec<String>>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct PostWithAuthor {
    pub post: Post,
    pub author_username: String,
    pub author_display_name: String,
    pub author_avatar_url: String,
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(
        MemoryManager::init(DefaultMemoryImpl::default())
    );
    
    static POSTS: RefCell<StableBTreeMap<u64, Post, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        )
    );
    
    static USER_POSTS: RefCell<StableBTreeMap<Principal, Vec<u64>, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        )
    );
    
    static POST_COUNTER: RefCell<u64> = RefCell::new(0);
}

#[update]
fn create_post(request: CreatePostRequest) -> Result<Post, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot create posts".to_string());
    }
    
    if request.content.trim().is_empty() {
        return Err("Post content cannot be empty".to_string());
    }
    
    POST_COUNTER.with(|counter| {
        let mut counter = counter.borrow_mut();
        *counter += 1;
        let post_id = *counter;
        
        let now = time();
        let post = Post {
            id: post_id,
            author: caller,
            content: request.content,
            media_urls: request.media_urls,
            created_at: now,
            updated_at: now,
            likes: Vec::new(),
            like_count: 0,
        };
        
        POSTS.with(|posts| {
            posts.borrow_mut().insert(post_id, post.clone());
        });
        
        USER_POSTS.with(|user_posts| {
            let mut user_posts = user_posts.borrow_mut();
            let mut posts = user_posts.get(&caller).unwrap_or_default();
            posts.push(post_id);
            user_posts.insert(caller, posts);
        });
        
        Ok(post)
    })
}

#[update]
fn update_post(post_id: u64, request: UpdatePostRequest) -> Result<Post, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot update posts".to_string());
    }
    
    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        
        match posts.get(&post_id) {
            Some(mut post) => {
                if post.author != caller {
                    return Err("You can only update your own posts".to_string());
                }
                
                if let Some(content) = request.content {
                    if content.trim().is_empty() {
                        return Err("Post content cannot be empty".to_string());
                    }
                    post.content = content;
                }
                
                if let Some(media_urls) = request.media_urls {
                    post.media_urls = media_urls;
                }
                
                post.updated_at = time();
                posts.insert(post_id, post.clone());
                Ok(post)
            }
            None => Err("Post not found".to_string()),
        }
    })
}

#[update]
fn delete_post(post_id: u64) -> Result<(), String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot delete posts".to_string());
    }
    
    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        
        match posts.get(&post_id) {
            Some(post) => {
                if post.author != caller {
                    return Err("You can only delete your own posts".to_string());
                }
                
                posts.remove(&post_id);
                
                USER_POSTS.with(|user_posts| {
                    let mut user_posts = user_posts.borrow_mut();
                    if let Some(mut posts) = user_posts.get(&caller) {
                        posts.retain(|&id| id != post_id);
                        user_posts.insert(caller, posts);
                    }
                });
                
                Ok(())
            }
            None => Err("Post not found".to_string()),
        }
    })
}

#[update]
fn like_post(post_id: u64) -> Result<Post, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot like posts".to_string());
    }
    
    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        
        match posts.get(&post_id) {
            Some(mut post) => {
                if !post.likes.contains(&caller) {
                    post.likes.push(caller);
                    post.like_count += 1;
                    posts.insert(post_id, post.clone());
                }
                Ok(post)
            }
            None => Err("Post not found".to_string()),
        }
    })
}

#[update]
fn unlike_post(post_id: u64) -> Result<Post, String> {
    let caller = ic_cdk::caller();
    
    if caller == Principal::anonymous() {
        return Err("Anonymous users cannot unlike posts".to_string());
    }
    
    POSTS.with(|posts| {
        let mut posts = posts.borrow_mut();
        
        match posts.get(&post_id) {
            Some(mut post) => {
                if let Some(index) = post.likes.iter().position(|&x| x == caller) {
                    post.likes.remove(index);
                    post.like_count = post.like_count.saturating_sub(1);
                    posts.insert(post_id, post.clone());
                }
                Ok(post)
            }
            None => Err("Post not found".to_string()),
        }
    })
}

#[query]
fn get_post(post_id: u64) -> Result<Post, String> {
    POSTS.with(|posts| {
        let posts = posts.borrow();
        match posts.get(&post_id) {
            Some(post) => Ok(post.clone()),
            None => Err("Post not found".to_string()),
        }
    })
}

#[query]
fn get_user_posts(user: Principal) -> Vec<Post> {
    USER_POSTS.with(|user_posts| {
        let user_posts = user_posts.borrow();
        match user_posts.get(&user) {
            Some(post_ids) => {
                POSTS.with(|posts| {
                    let posts = posts.borrow();
                    post_ids
                        .iter()
                        .filter_map(|&id| posts.get(&id))
                        .collect()
                })
            }
            None => Vec::new(),
        }
    })
}

#[query]
fn get_recent_posts(limit: u64, offset: u64) -> Vec<Post> {
    POSTS.with(|posts| {
        let posts = posts.borrow();
        let mut all_posts: Vec<Post> = posts.iter().map(|(_, post)| post.clone()).collect();
        all_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        let start = offset as usize;
        let end = std::cmp::min(start + limit as usize, all_posts.len());
        
        if start >= all_posts.len() {
            Vec::new()
        } else {
            all_posts[start..end].to_vec()
        }
    })
}

#[query]
fn get_posts_by_users(users: Vec<Principal>, limit: u64, offset: u64) -> Vec<Post> {
    POSTS.with(|posts| {
        let posts = posts.borrow();
        let mut user_posts: Vec<Post> = posts
            .iter()
            .filter_map(|(_, post)| {
                if users.contains(&post.author) {
                    Some(post.clone())
                } else {
                    None
                }
            })
            .collect();
        
        user_posts.sort_by(|a, b| b.created_at.cmp(&a.created_at));
        
        let start = offset as usize;
        let end = std::cmp::min(start + limit as usize, user_posts.len());
        
        if start >= user_posts.len() {
            Vec::new()
        } else {
            user_posts[start..end].to_vec()
        }
    })
}

ic_cdk::export_candid!();