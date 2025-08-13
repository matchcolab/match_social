// Utility function to generate unique 6-character App ID
export function generateAppId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utility function to calculate age from date of birth
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Utility function to format user display name for App ID
export function formatUserDisplayId(user: any): string {
  if (!user.gender || !user.dateOfBirth || !user.appId) {
    return user.appId || 'Unknown';
  }
  
  const genderCode = user.gender === 'male' ? 'M' : 
                    user.gender === 'female' ? 'F' : 
                    user.gender === 'non_binary' ? 'NB' : 'U';
  const age = calculateAge(new Date(user.dateOfBirth));
  
  return `${genderCode}/${age}/${user.appId}`;
}