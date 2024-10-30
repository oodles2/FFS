import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const MatchupsPage = () => {
  const [matchups, setMatchups] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [maxWeek, setMaxWeek] = useState(1);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState({});

  const leagueId = '1073826869285421056';

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
          avatar: user?.avatar
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
      <div className="p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">MatchUps - Week {selectedWeek}</h1>

        {/* Week Selector - Centered on Mobile */}
        <div className="flex flex-wrap justify-center space-x-2 mb-6">
          {Array.from({ length: maxWeek }, (_, i) => i + 1).map((week) => (
            <button
              key={week}
              onClick={() => handleWeekChange(week)}
              className={`px-3 py-1 m-1 ${week === selectedWeek ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} rounded`}
            >
              Week {week}
            </button>
          ))}
        </div>

        {/* Matchups List */}
        <div className="space-y-4">
          {matchups.length > 0 ? (
            matchups.map((matchup, index) => (
              <details key={index} className="bg-gray-100 shadow rounded-lg mx-auto p-4 max-w-full md:max-w-3xl">
                <summary className="text-md md:text-lg font-bold bg-black text-white p-2 text-center cursor-pointer">
                  {getTeamName(matchup.team1)} {matchup.team1Score} - {matchup.team2Score} {getTeamName(matchup.team2)}
                </summary>

                <div className="flex flex-col md:flex-row justify-between mt-4">
                  <div className="w-full md:w-1/2 text-left mb-4 md:mb-0">
                    <h4 className="font-bold text-black mb-2">{getTeamName(matchup.team1)}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto border-collapse border border-gray-200">
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
                                {getPlayerName(playerId)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 text-left">
                    <h4 className="font-bold text-black mb-2">{getTeamName(matchup.team2)}</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto border-collapse border border-gray-200">
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
              </details>
            ))
          ) : (
            <p>No matchups available for this week</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MatchupsPage;
