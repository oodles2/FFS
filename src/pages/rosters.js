import { useEffect, useState } from 'react';
import { getLeagueData } from '../services/sleeper';
import Layout from '../components/Layout';

const RostersPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const leagueId = '1073826869285421056';

  useEffect(() => {
    const fetchTeams = async () => {
      const data = await getLeagueData(leagueId);
      setTeams(data);
      setSelectedTeam(data[0]);
    };
    fetchTeams();
  }, []);

  const positionOrder = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];

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

  const sortedPlayers = selectedTeam?.players?.sort((a, b) => {
    const posA = positionOrder.indexOf(a.fantasyPosition);
    const posB = positionOrder.indexOf(b.fantasyPosition);
    return posA - posB;
  });

  return (
    <Layout>
      <div className="p-4">
        {/* Dropdown on small screens */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full bg-gray-800 text-white p-2 rounded"
          >
            {selectedTeam ? selectedTeam.teamName : 'Select a Team'}
          </button>
          {dropdownOpen && (
            <ul className="bg-gray-800 text-white mt-2 rounded shadow-lg">
              {teams.map((team) => (
                <li
                  key={team.teamId}
                  onClick={() => {
                    setSelectedTeam(team);
                    setDropdownOpen(false);
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-600"
                >
                  {team.teamName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sidebar on medium and larger screens */}
        <div className="hidden md:block md:col-span-1 bg-gray-800 text-white p-4">
          <ul>
            {teams.map((team) => (
              <li
                key={team.teamId}
                className={`cursor-pointer p-2 hover:bg-gray-600 ${selectedTeam?.teamId === team.teamId ? 'bg-gray-600' : ''}`}
                onClick={() => setSelectedTeam(team)}
              >
                {team.avatar && (
                  <img src={team.avatar} alt={`${team.teamName} avatar`} className="w-10 h-10 rounded-full mr-2 inline" />
                )}
                <span>{team.teamName}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Content */}
        <div className="bg-gray-200 p-4 overflow-x-auto">
          {selectedTeam ? (
            <div>
              <div className="flex items-center mb-4">
                {selectedTeam.avatar && (
                  <img src={selectedTeam.avatar} alt={`${selectedTeam.teamName} avatar`} className="w-16 h-16 rounded-full mr-4" />
                )}
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedTeam.teamName}</h2>
                  <p className="text-gray-700 mt-1">{selectedTeam.displayName}</p>
                </div>
                <p className="text-gray-500 ml-2 mt-1">{selectedTeam.wins}-{selectedTeam.losses}</p>
              </div>

              <table className="min-w-full bg-white overflow-x-auto">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border bg-gray-400 font-semibold text-black">Position</th>
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
                          style={{ backgroundColor: getPlayerPositionColor(player.fantasyPosition) }}
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
