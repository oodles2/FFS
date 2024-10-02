import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const MatchupsPage = () => {
  const [matchups, setMatchups] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [maxWeek, setMaxWeek] = useState(1);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState({});

  const leagueId = '1073826869285421056'; // Your actual Sleeper league ID

  useEffect(() => {
    fetchMaxWeek();
    fetchTeams();
    fetchPlayers();
  }, [leagueId]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('https://api.sleeper.app/v1/players/nfl');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
      const teamsResponse = response.data;
      const usersResponse = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/users`);
      const users = usersResponse.data;

      const teamsWithNames = teamsResponse.map(roster => {
        const user = users.find(user => user.user_id === roster.owner_id);
        return {
          teamId: roster.roster_id,
          teamName: user?.display_name || 'Unknown Team',
          avatar: user?.avatar // Adding avatar for the player
        };
      });
      setTeams(teamsWithNames);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchMatchups = async (week) => {
    try {
      const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`);
      const matchupsData = response.data.reduce((acc, matchup) => {
        const existingMatchup = acc.find(m => m.matchupId === matchup.matchup_id);
        if (existingMatchup) {
          existingMatchup.team2 = matchup.roster_id;
          existingMatchup.team2Score = matchup.points;
          existingMatchup.team2Starters = matchup.starters;
        } else {
          acc.push({
            matchupId: matchup.matchup_id,
            team1: matchup.roster_id,
            team1Score: matchup.points,
            team1Starters: matchup.starters,
          });
        }
        return acc;
      }, []);
      setMatchups(matchupsData);
    } catch (error) {
      console.error('Error fetching matchups:', error);
    }
  };

  const fetchMaxWeek = async () => {
    try {
      const response = await axios.get(`https://api.sleeper.app/v1/state/nfl`);
      const currentWeek = response.data.week;
      setMaxWeek(currentWeek);
      setSelectedWeek(currentWeek);
      fetchMatchups(currentWeek);
    } catch (error) {
      console.error('Error fetching max week:', error);
    }
  };

  const handleWeekChange = (week) => {
    setSelectedWeek(week);
    fetchMatchups(week);
  };

  const getTeamName = (teamId) => {
    const team = teams.find((team) => team.teamId === teamId);
    return team ? team.teamName : 'Unknown Team';
  };

  const getPlayerName = (playerId) => {
    const player = players[playerId];
    if (player && player.position === 'DEF') {
      return `${player.team}`;
    }
    if (!player || !player.full_name) {
      return `Player from ${player?.team || 'Unknown Team'}`;
    }
    return `${player.full_name}`;
  };

  const getPlayerPositionColor = (position) => {
    switch (position) {
      case 'QB': return '#ff2a6d';
      case 'RB': return '#00ceb8';
      case 'WR': return '#58a7ff';
      case 'TE': return '#ffae58';
      case 'K': return '#bd66ff';
      case 'DEF': return '#7988a1';
      default: return '#ffffff';
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">MatchUps - Week {selectedWeek}</h1>

        {/* Dynamic Week Buttons */}
        <div className="flex space-x-4 mb-6 justify-center">
          {Array.from({ length: maxWeek }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => handleWeekChange(week)}
              className={`px-4 py-2 ${week === selectedWeek ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} rounded`}
            >
              Week {week}
            </button>
          ))}
        </div>

        {/* List of Matchups */}
        <div>
          {matchups.length > 0 ? (
            matchups.map((matchup, index) => (
              <div key={index} className="mb-4 p-4 bg-white shadow rounded mx-auto max-w-4xl">
                <h3 className="text-lg font-bold bg-black text-white p-2 text-center">Matchup {index + 1}</h3>

                <div className="flex justify-between items-center mt-4">
                  {/* Team 1 */}
                  <div className="w-1/3 text-left">
                    <h4 className="font-bold">{getTeamName(matchup.team1)}</h4>
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                      <thead>
                        <tr>
                          <th className="border border-gray-200 px-2 py-1">Pos</th>
                          <th className="border border-gray-200 px-2 py-1">Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchup.team1Starters.map((playerId) => (
                          <tr key={playerId}>
                            <td
                              className="border border-gray-200 px-2 py-1 text-black"
                              style={{ backgroundColor: getPlayerPositionColor(players[playerId]?.position) }}
                            >
                              {players[playerId]?.position || 'N/A'}
                            </td>
                            <td className="border border-gray-200 px-2 py-1">
                              {players[playerId]?.avatar && (
                                <img
                                  src={`https://sleepercdn.com/avatars/thumbs/${players[playerId].avatar}`}
                                  alt="Avatar"
                                  className="inline-block w-6 h-6 rounded-full mr-2"
                                />
                              )}
                              {getPlayerName(playerId)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Centered Score */}
                  <div className="text-center w-1/3 font-bold text-2xl" style={{ fontSize: '120%' }}>
                    {matchup.team1Score} | {matchup.team2Score}
                  </div>

                  {/* Team 2 */}
                  <div className="w-1/3 text-right">
                    <h4 className="font-bold">{getTeamName(matchup.team2)}</h4>
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                      <thead>
                        <tr>
                          <th className="border border-gray-200 px-2 py-1">Name</th>
                          <th className="border border-gray-200 px-2 py-1">Pos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matchup.team2Starters.map((playerId) => (
                          <tr key={playerId}>
                            <td className="border border-gray-200 px-2 py-1">
                              {players[playerId]?.avatar && (
                                <img
                                  src={`https://sleepercdn.com/avatars/thumbs/${players[playerId].avatar}`}
                                  alt="Avatar"
                                  className="inline-block w-6 h-6 rounded-full mr-2"
                                />
                              )}
                              {getPlayerName(playerId)}
                            </td>
                            <td
                              className="border border-gray-200 px-2 py-1 text-black"
                              style={{ backgroundColor: getPlayerPositionColor(players[playerId]?.position) }}
                            >
                              {players[playerId]?.position || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No matchups available for this week.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MatchupsPage;
