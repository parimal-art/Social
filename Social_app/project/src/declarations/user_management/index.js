export const idlFactory = ({ IDL }) => {
  const CreateUserRequest = IDL.Record({
    'bio' : IDL.Text,
    'username' : IDL.Text,
    'avatar_url' : IDL.Text,
    'display_name' : IDL.Text,
  });
  const UserProfile = IDL.Record({
    'bio' : IDL.Text,
    'username' : IDL.Text,
    'principal' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'avatar_url' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'is_verified' : IDL.Bool,
    'display_name' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : UserProfile, 'Err' : IDL.Text });
  const UpdateUserRequest = IDL.Record({
    'bio' : IDL.Opt(IDL.Text),
    'avatar_url' : IDL.Opt(IDL.Text),
    'display_name' : IDL.Opt(IDL.Text),
  });
  return IDL.Service({
    'create_user' : IDL.Func([CreateUserRequest], [Result], []),
    'get_all_users' : IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
    'get_current_user' : IDL.Func([], [Result], ['query']),
    'get_user' : IDL.Func([IDL.Principal], [Result], ['query']),
    'get_user_by_username' : IDL.Func([IDL.Text], [Result], ['query']),
    'update_user' : IDL.Func([UpdateUserRequest], [Result], []),
    'username_available' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
  });
};