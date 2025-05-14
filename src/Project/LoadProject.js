import { supabase } from '../config/supabaseClient';

export const getProjectWithUsersAndIssues = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Unauthorized or user not found');
  }

  // Fetch user details (to get projectId)
  const { data: userDetails, error: userDetailsError } = await supabase
    .from('users')
    .select('projectId')
    .eq('email', user.email)
    .single();

  if (userDetailsError || !userDetails) {
    throw new Error('Failed to fetch user details');
  }

  const { data: project, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      users(*)
    `,
    )
    .eq('id', userDetails.projectId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return project;
};

export const updateProject = async updatedFields => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Unauthorized or user not found');
  }

  const { data: userDetails, error: userDetailsError } = await supabase
    .from('users')
    .select('projectId')
    .eq('id', user.id)
    .single();

  if (userDetailsError || !userDetails) {
    throw new Error('Failed to fetch user details');
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updatedFields)
    .eq('id', userDetails.projectId)
    .select('id, name, description, updatedAt');

  if (error) {
    throw new Error(error.message);
  }

  return data[0];
};
