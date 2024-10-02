import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const DraftResultsPage = () => {
  const [draftData, setDraftData] = useState([]);
  const [availableDrafts, setAvailableDrafts] = useState([]);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [users, setUsers] = useState([]);
  const [players, setPlayers] = useState({});
  const [rounds, setRounds] = useState([]);

  const leagueId = '1073826869285421056'; // Your Sleeper league ID

  useEffect(() => {
    fetchAvailableDrafts();
    fetchUsers();
    fetchPlayers();
  }, []);

  const fetchAvailableDrafts = async () => {
    try {
      const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/drafts`);
      const drafts = response.data.map(draft => ({
        ...draft,
        name: draft.rounds > 10 ? 'Startup Draft' : `${draft.season} Draft`,
        rounds: draft.rounds
      }));
      setAvailableDrafts(drafts);
      setSelectedDraftId(drafts[0].draft_id);
      fetchDraftData(drafts[0].draft_id);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('https://api.sleeper.app/v1/players/nfl');
      setPlayers(response.data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDraftData = async (draftId) => {
    try {
      const response = await axios.get(`https://api.sleeper.app/v1/draft/${draftId}/picks`);
      setDraftData(response.data);
      const rounds = Math.max(...response.data.map(pick => pick.round));
      setRounds(Array.from({ length: rounds }, (_, i) => i + 1));
    } catch (error) {
      console.error('Error fetching draft data:', error);
    }
  };

  const handleDraftChange = (draftId) => {
    setSelectedDraftId(draftId);
    fetchDraftData(draftId);
  };

  const getDraftedPlayer = (round, draftSlot) => {
    const pick = draftData.find(pick => pick.round === round && pick.draft_slot === draftSlot);
    if (pick && players[pick.player_id]) {
      const player = players[pick.player_id];
      return player.full_name || 'Unknown Player';
    }
    return 'N/A';
  };

  const getPickedByUser = (round, draftSlot) => {
    const pick = draftData.find(pick => pick.round === round && pick.draft_slot === draftSlot);
    if (pick) {
      const user = users.find(user => user.user_id === pick.picked_by);
      return user ? user.display_name : 'Unknown User';
    }
    return 'Unknown User';
  };

  return (
    <Layout>
      <div className="p-8 bg-white"> {/* Background set to white */}
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Draft Results</h1>

        {/* Draft Year Selector */}
        <div className="flex justify-center mb-6">
          <select 
            className="px-4 py-2 rounded bg-gray-300 text-black"
            value={selectedDraftId || ''} 
            onChange={(e) => handleDraftChange(e.target.value)}
          >
            {availableDrafts.map(draft => (
              <option key={draft.draft_id} value={draft.draft_id}>
                {draft.name}
              </option>
            ))}
          </select>
        </div>

        {/* Draft Results Table */}
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-900"> {/* Header with gray background */}
              <th className="border border-gray-300 px-4 py-2">Round</th>
              {Array.from({ length: 10 }).map((_, i) => (
                <th key={i + 1} className="border border-gray-300 px-4 py-2">Slot {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rounds.map(round => (
              <tr key={round} className="bg-white text-gray-900"> {/* White background for rows */}
                <td className="border border-gray-300 px-4 py-2">Round {round}</td>
                {Array.from({ length: 10 }).map((_, slot) => (
                  <td key={slot + 1} className="border border-gray-300 px-4 py-2">
                    <div className="font-bold text-black">{getDraftedPlayer(round, slot + 1)}</div> {/* Player name */}
                    <div className="text-xs text-gray-500">{getPickedByUser(round, slot + 1)}</div> {/* User name */}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default DraftResultsPage;
