import axios from 'axios';

const BASE_URL = 'https://api.sleeper.app/v1';

export const getLeagueData = async (leagueId) => {
  try {
    // Fetch rosters and users
    const rostersResponse = await axios.get(`${BASE_URL}/league/${leagueId}/rosters`);
    const usersResponse = await axios.get(`${BASE_URL}/league/${leagueId}/users`);

    const rosters = rostersResponse.data;
    const users = usersResponse.data;

    // Fetch all player data (for player names and NFL teams)
    const playersResponse = await axios.get('https://api.sleeper.app/v1/players/nfl');
    const allPlayers = playersResponse.data;

    // Combine rosters, user data, and player data
    const teams = rosters.map(roster => {
      const user = users.find(user => user.user_id === roster.owner_id);
      const playerDetails = roster.players?.map(playerId => {
        const player = allPlayers[playerId];
        return {
          name: player ? player.full_name : playerId,
          team: player ? player.team : 'Unknown Team',
          fantasyPosition: player ? player.fantasy_positions?.join(', ') : 'N/A'
        };
      }) || [];

      return {
        teamId: roster.roster_id,
        ownerId: roster.owner_id,
        teamName: user?.metadata?.team_name || user?.display_name || 'Unknown Team',
        avatar: user?.avatar ? `https://sleepercdn.com/avatars/${user.avatar}` : null,
        displayName: user?.display_name || 'Unknown User',
        wins: roster.settings?.wins || 0,  // Add wins
        losses: roster.settings?.losses || 0,  // Add losses
        players: playerDetails
      };
    });

    return teams;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};
