import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, Clock } from 'lucide-react';
import { GameSettings } from '../../types';
import { Card } from '../shared/Card';
import { BoxControl } from '../shared/BoxControl';

interface TeamSettingsProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  playerCount: number;
}

export const TeamSettings: React.FC<TeamSettingsProps> = ({
  settings,
  onUpdateSettings,
  playerCount
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);


  const handleSettingChange = (key: keyof GameSettings, value: number) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);

    // Apply changes immediately - no validation needed
    onUpdateSettings({ [key]: value });
  };

  const applySettings = () => {
    onUpdateSettings(localSettings);
  };

  const resetToDefaults = () => {
    const defaults: GameSettings = {
      teamsCount: 4,
      playersPerTeam: 5,
      matchDuration: 15,
      gamesPerTeam: 3
    };
    setLocalSettings(defaults);
    onUpdateSettings(defaults);
  };

  const totalSlotsNeeded = localSettings.teamsCount * localSettings.playersPerTeam;
  const utilizationRate = Math.round((totalSlotsNeeded / Math.max(playerCount, 1)) * 100);


  return (
    <Card glass padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Team Configuration</h3>
            <p className="text-sm text-gray-400">Customize team setup and match settings</p>
          </div>
        </div>


        {/* Configuration Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{localSettings.teamsCount}</div>
            <div className="text-xs text-gray-400">Teams</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{localSettings.playersPerTeam}</div>
            <div className="text-xs text-gray-400">Players/Team</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-white">{totalSlotsNeeded}</div>
            <div className="text-xs text-gray-400">Total Slots</div>
          </div>
          <div className="bg-surface-elevated rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-400">
              {Math.min(utilizationRate, 100)}%
            </div>
            <div className="text-xs text-gray-400">Utilization</div>
          </div>
        </div>

        {/* Player Distribution Info */}
        {totalSlotsNeeded > playerCount && playerCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Users size={16} />
              <span className="font-medium">Flexible Team Distribution</span>
            </div>
            <div className="text-blue-400 text-sm">
              <p>Teams will be created with {playerCount} available players:</p>
              <div className="mt-2 space-y-1">
                {(() => {
                  const playersPerFullTeam = Math.floor(playerCount / localSettings.teamsCount);
                  const extraPlayers = playerCount % localSettings.teamsCount;
                  const fullTeams = localSettings.teamsCount - extraPlayers;

                  return (
                    <>
                      {fullTeams > 0 && (
                        <div>• {fullTeams} team{fullTeams !== 1 ? 's' : ''} with {playersPerFullTeam} player{playersPerFullTeam !== 1 ? 's' : ''}</div>
                      )}
                      {extraPlayers > 0 && (
                        <div>• {extraPlayers} team{extraPlayers !== 1 ? 's' : ''} with {playersPerFullTeam + 1} player{playersPerFullTeam + 1 !== 1 ? 's' : ''}</div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium text-white flex items-center space-x-2">
              <Users size={16} />
              <span>Team Structure</span>
            </h4>

            <div className="space-y-4">
              <BoxControl
                label="Number of Teams"
                value={localSettings.teamsCount}
                min={2}
                max={8}
                onChange={(value) => handleSettingChange('teamsCount', value)}
                description={`${localSettings.teamsCount} teams competing`}
              />

              <BoxControl
                label="Players per Team"
                value={localSettings.playersPerTeam}
                min={1}
                max={11}
                onChange={(value) => handleSettingChange('playersPerTeam', value)}
                description={`${localSettings.playersPerTeam}v${localSettings.playersPerTeam} format`}
              />
            </div>
          </div>

          {/* Match Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium text-white flex items-center space-x-2">
              <Clock size={16} />
              <span>Match Settings</span>
            </h4>

            <div className="space-y-4">
              <BoxControl
                label="Match Duration"
                value={localSettings.matchDuration}
                min={5}
                max={90}
                step={1}
                onChange={(value) => handleSettingChange('matchDuration', value)}
                description={`${localSettings.matchDuration} minutes per match`}
                unit="min"
              />

              <BoxControl
                label="Games per Team"
                value={localSettings.gamesPerTeam}
                min={1}
                max={10}
                onChange={(value) => handleSettingChange('gamesPerTeam', value)}
                description={`Each team plays ${localSettings.gamesPerTeam} match${localSettings.gamesPerTeam !== 1 ? 'es' : ''}`}
              />
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-600">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Reset to Defaults
          </button>

          <button
            onClick={applySettings}
            className="px-4 py-2 bg-pitch-green text-white rounded-lg hover:bg-green-500 transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </Card>
  );
};

