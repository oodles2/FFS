import { useEffect, useState } from 'react';
import { getLeagueData } from '../services/sleeper';
import Layout from '../components/Layout'; // Include Layout

const RostersPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const leagueId = '1073826869285421056'; // Your actual Sleeper league ID

  useEffect(() => {
    const fetchTeams = async () => {
      const data = await getLeagueData(leagueId);
      console.log('Fetched Teams:', data);
      setTeams(data);
      setSelectedTeam(data[0]); // Automatically select the first team
    };
    fetchTeams();
  }, []);

  // Define the position order
  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

  // Define the position color
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

  // Sort players according to the custom order
  const sortedPlayers = selectedTeam?.players?.sort((a, b) => {
    const posA = positionOrder.indexOf(a.fantasyPosition);
    const posB = positionOrder.indexOf(b.fantasyPosition);
    return posA - posB;
  });

  return (
    <Layout> {/* Wrap content with Layout */}
      <div className="grid grid-cols-4 gap-4 h-screen">
        {/* Left Sidebar: Team List with Avatar and Display Name */}
        <div className="bg-gray-800 text-white p-4 col-span-1">
          <ul>
            {teams.map((team) => (
              <li
                key={team.teamId}
                className={`cursor-pointer p-2 hover:bg-gray-600 flex items-center ${selectedTeam?.teamId === team.teamId ? 'bg-gray-600' : ''}`}
                onClick={() => setSelectedTeam(team)}
              >
                {team.avatar && (
                  <img src={team.avatar} alt={`${team.teamName} avatar`} className="w-10 h-10 rounded-full mr-2" />
                )}
                <div className="flex flex-col">
                  <span>{team.teamName}</span>
                  <p className="text-sm text-gray-400">{team.displayName}</p> {/* Display Name directly under team name */}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content: Team Players with Sorted Positions */}
        <div className="bg-gray-200 p-4 col-span-3">
          {selectedTeam ? (
            <div>
              <div className="flex items-center mb-4">
                {selectedTeam.avatar && (
                  <img src={selectedTeam.avatar} alt={`${selectedTeam.teamName} avatar`} className="w-16 h-16 rounded-full mr-4" />
                )}
                <div className="flex flex-col">
                  <h2 className="text-3xl font-bold text-gray-900">{selectedTeam.teamName}</h2>
                  <p className="text-gray-700 mt-1">{selectedTeam.displayName}</p> {/* Moved the display name directly under the team name */}
                </div>
                <p className="text-gray-500 ml-2 mt-1">{selectedTeam.wins}-{selectedTeam.losses}</p> {/* Record next to team name */}
              </div>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border bg-gray-400 font-semibold text-black">Positions</th>
                    <th className="py-2 px-4 border bg-gray-400 font-semibold text-black">Player</th>
                    <th className="py-2 px-4 border bg-gray-400 font-semibold text-black">Team</th>
                    
                  </tr>
                </thead>
                    <tbody>
                        {sortedPlayers?.length > 0 ? (
                            sortedPlayers.map((player, index) => (
                            <tr key={index} className="text-center">
                                <td
                                className="py-2 px-4 border text-gray-800 font-medium"
                                style={{ backgroundColor: getPlayerPositionColor(player.fantasyPosition) }} // Apply position-specific color
                                >
                                {player.fantasyPosition || 'N/A'}
                                </td>
                                <td className="py-2 px-4 border text-gray-800 font-medium">{player.name}</td>
                                <td className="py-2 px-4 border text-gray-800 font-medium">{player.team}</td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td className="py-2 px-4 border" colSpan="3">No players on this roster</td>
                            </tr>
                     )}
                </tbody>

              </table>
            </div>
          ) : (
            <p>Select a team to see their roster</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RostersPage;
