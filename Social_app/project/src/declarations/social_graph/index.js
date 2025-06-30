export const idlFactory = ({ IDL }) => {
  const SocialStats = IDL.Record({
    'following_count' : IDL.Nat64,
    'followers_count' : IDL.Nat64,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  return IDL.Service({
    'follow_user' : IDL.Func([IDL.Principal], [Result], []),
    'get_follow_suggestions' : IDL.Func(
        [IDL.Principal, IDL.Nat64],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_followers' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_following' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_mutual_followers' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Vec(IDL.Principal)],
        ['query'],
      ),
    'get_social_stats' : IDL.Func([IDL.Principal], [SocialStats], ['query']),
    'is_following' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Bool],
        ['query'],
      ),
    'unfollow_user' : IDL.Func([IDL.Principal], [Result], []),
  });
};