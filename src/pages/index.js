import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const HomePage = () => {
  const [teams, setTeams] = useState([]);
  const [divisions, setDivisions] = useState({});
  const leagueId = '1073826869285421056'; // Your actual Sleeper league ID

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      const rostersResponse = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
      const usersResponse = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/users`);
      const rosters = rostersResponse.data;
      const users = usersResponse.data;

      const standings = rosters.map(roster => {
        const user = users.find(user => user.user_id === roster.owner_id);
        return {
          teamName: user ? user.display_name : 'Unknown Team',
          division: roster.settings.division,
          wins: roster.settings.wins,
          losses: roster.settings.losses,
          points: roster.settings.fpts
        };
      });

      setTeams(standings);

      const groupedByDivision = standings.reduce((acc, team) => {
        if (!acc[team.division]) {
          acc[team.division] = [];
        }
        acc[team.division].push(team);
        return acc;
      }, {});

      Object.keys(groupedByDivision).forEach(division => {
        groupedByDivision[division].sort((a, b) => b.wins - a.wins);
      });

      setDivisions(groupedByDivision);
    } catch (error) {
      console.error('Error fetching standings:', error);
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-white">
        <h1 className="text-3xl font-bold mb-4">Current Standings</h1>

        {/* Division Standings - Side by Side */}
        <div className="flex justify-between mb-8">
          {Object.keys(divisions).map((division, index) => (
            <div
              key={division}
              className={`w-1/2 ${index === 0 ? 'mr-4' : 'ml-4'}`} // Add gap between the division tables
            >
              <h3 className="text-xl font-bold mb-2 text-center">Division {division}</h3>
              <table className="min-w-full table-auto border-collapse border border-gray-300 text-center mb-4">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-gray-300 px-4 py-2">Team Name</th>
                    <th className="border border-gray-300 px-4 py-2">Wins</th>
                    <th className="border border-gray-300 px-4 py-2">Losses</th>
                    <th className="border border-gray-300 px-4 py-2">Points For</th>
                  </tr>
                </thead>
                <tbody>
                  {divisions[division].map((team, index) => (
                    <tr key={index} className="bg-white text-black">
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="text-xl font-bold">{team.teamName}</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{team.wins}</td>
                      <td className="border border-gray-300 px-4 py-2">{team.losses}</td>
                      <td className="border border-gray-300 px-4 py-2">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Overall Standings - Below the Division Tables */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black">Overall Standings</h2>
          <table className="min-w-full table-auto border-collapse border border-gray-300 text-center">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border border-gray-300 px-4 py-2">Team Name</th>
                <th className="border border-gray-300 px-4 py-2">Wins</th>
                <th className="border border-gray-300 px-4 py-2">Losses</th>
                <th className="border border-gray-300 px-4 py-2">Points For</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={index} className="bg-white text-black">
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="text-xl font-bold">{team.teamName}</div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{team.wins}</td>
                  <td className="border border-gray-300 px-4 py-2">{team.losses}</td>
                  <td className="border border-gray-300 px-4 py-2">{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
