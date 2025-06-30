export const idlFactory = ({ IDL }) => {
  const CreatePostRequest = IDL.Record({
    'content' : IDL.Text,
    'media_urls' : IDL.Vec(IDL.Text),
  });
  const Post = IDL.Record({
    'id' : IDL.Nat64,
    'content' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'created_at' : IDL.Nat64,
    'author' : IDL.Principal,
    'like_count' : IDL.Nat64,
    'likes' : IDL.Vec(IDL.Principal),
    'media_urls' : IDL.Vec(IDL.Text),
  });
  const Result = IDL.Variant({ 'Ok' : Post, 'Err' : IDL.Text });
  const UpdatePostRequest = IDL.Record({
    'content' : IDL.Opt(IDL.Text),
    'media_urls' : IDL.Opt(IDL.Vec(IDL.Text)),
  });
  const Result_1 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'create_post' : IDL.Func([CreatePostRequest], [Result], []),
    'delete_post' : IDL.Func([IDL.Nat64], [Result_1], []),
    'get_post' : IDL.Func([IDL.Nat64], [Result], ['query']),
    'get_posts_by_users' : IDL.Func(
        [IDL.Vec(IDL.Principal), IDL.Nat64, IDL.Nat64],
        [IDL.Vec(Post)],
        ['query'],
      ),
    'get_recent_posts' : IDL.Func(
        [IDL.Nat64, IDL.Nat64],
        [IDL.Vec(Post)],
        ['query'],
      ),
    'get_user_posts' : IDL.Func([IDL.Principal], [IDL.Vec(Post)], ['query']),
    'like_post' : IDL.Func([IDL.Nat64], [Result], []),
    'unlike_post' : IDL.Func([IDL.Nat64], [Result], []),
    'update_post' : IDL.Func([IDL.Nat64, UpdatePostRequest], [Result], []),
  });
};