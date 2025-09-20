import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Users, Target, AlertTriangle, Info } from 'lucide-react';
import { GameSettings, Team } from '../../types';
import { Card } from '../shared/Card';
import { BoxControl } from '../shared/BoxControl';

interface ScheduleSettingsProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  teams: Team[];
  scheduleStats: {
    totalGames: number;
    gamesPerTeam: number;
    estimatedDuration: number;
    averageRestTime: number;
  };
}

export const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({
  settings,
  onUpdateSettings,
  teams,
  scheduleStats
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Validate and calculate warnings
  useEffect(() => {
    const warnings: string[] = [];

    if (localSettings.gamesPerTeam > 5) {
      warnings.push('High number of games per team may lead to fatigue');
    }

    if (localSettings.matchDuration > 20 && teams.length > 4) {
      warnings.push('Long matches with many teams may extend tournament duration significantly');
    }

    const estimatedTotalTime = (teams.length > 1 ?
      Math.floor((localSettings.gamesPerTeam * teams.length) / 2) : 0) * localSettings.matchDuration;

    if (estimatedTotalTime > 180) {
      warnings.push('Tournament may last over 3 hours');
    }

    if (localSettings.gamesPerTeam < 2 && teams.length > 2) {
      warnings.push('Low games per team may not provide enough competitive balance');
    }

    setValidationWarnings(warnings);
  }, [localSettings, teams]);

  const handleSettingChange = (key: keyof GameSettings, value: number) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onUpdateSettings({ [key]: value });
  };

  // Calculate schedule predictions
  const calculatePredictions = () => {
    const totalTeams = teams.length;
    if (totalTeams < 2) return null;

    const maxPossibleGames = Math.floor((totalTeams * (totalTeams - 1)) / 2);
    const actualGames = Math.min(
      Math.floor((localSettings.gamesPerTeam * totalTeams) / 2),
      maxPossibleGames
    );

    return {
      totalGames: actualGames,
      estimatedDuration: actualGames * localSettings.matchDuration,
      gamesPerTeam: Math.floor((actualGames * 2) / totalTeams),
      maxPossibleGames
    };
  };

  const predictions = calculatePredictions();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card glass padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Settings className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-white">Schedule Configuration</h3>
            <p className="text-sm text-gray-400">Customize tournament format and timing</p>
          </div>
        </div>

        {/* Warnings */}
        {validationWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2 text-yellow-400 mb-2">
              <AlertTriangle size={16} />
              <span className="font-medium">Configuration Warnings</span>
            </div>
            <ul className="text-yellow-400 text-sm space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Current Predictions */}
        {predictions && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-blue-400 mb-3">
              <Info size={16} />
              <span className="font-medium">Schedule Predictions</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{predictions.totalGames}</div>
                <div className="text-gray-400">Total Games</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{predictions.gamesPerTeam}</div>
                <div className="text-gray-400">Games/Team</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{formatDuration(predictions.estimatedDuration)}</div>
                <div className="text-gray-400">Est. Duration</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-white">{predictions.maxPossibleGames}</div>
                <div className="text-gray-400">Max Possible</div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tournament Format */}
          <div className="space-y-4">
            <h4 className="font-medium text-white flex items-center space-x-2">
              <Target size={16} />
              <span>Tournament Format</span>
            </h4>

            <div className="space-y-4">
              <BoxControl
                label="Games per Team"
                value={localSettings.gamesPerTeam}
                min={1}
                max={10}
                onChange={(value) => handleSettingChange('gamesPerTeam', value)}
                description={`Each team will play ${localSettings.gamesPerTeam} match${localSettings.gamesPerTeam !== 1 ? 'es' : ''}`}
              />

              <div className="text-sm text-gray-400 bg-surface-elevated rounded-lg p-3">
                <div className="font-medium text-gray-300 mb-2">Format Explanation</div>
                <div className="space-y-1">
                  <div>• Round-robin style scheduling</div>
                  <div>• Smart rest time between matches</div>
                  <div>• Balanced opponent selection</div>
                  <div>• Automatic conflict avoidance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Match Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-white flex items-center space-x-2">
              <Clock size={16} />
              <span>Match Configuration</span>
            </h4>

            <div className="space-y-4">
              <BoxControl
                label="Match Duration"
                value={localSettings.matchDuration}
                min={5}
                max={45}
                step={1}
                onChange={(value) => handleSettingChange('matchDuration', value)}
                description={`${localSettings.matchDuration} minutes per match`}
                unit="min"
              />

              <div className="text-sm text-gray-400 bg-surface-elevated rounded-lg p-3">
                <div className="font-medium text-gray-300 mb-2">Timing Details</div>
                <div className="space-y-1">
                  <div>• Includes setup and break time</div>
                  <div>• Timer warnings at 1min, 30s, 10s</div>
                  <div>• Automatic match ending</div>
                  <div>• Flexible pause/resume options</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Strategy */}
        <div className="space-y-3">
          <h4 className="font-medium text-white flex items-center space-x-2">
            <Users size={16} />
            <span>Schedule Strategy</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-surface-elevated rounded-lg p-3 border border-gray-600">
              <div className="font-medium text-white text-sm mb-1">Rest Time Optimization</div>
              <div className="text-xs text-gray-400">Teams get adequate rest between matches</div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-3 border border-gray-600">
              <div className="font-medium text-white text-sm mb-1">Balanced Competition</div>
              <div className="text-xs text-gray-400">Fair opponent distribution for all teams</div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-3 border border-gray-600">
              <div className="font-medium text-white text-sm mb-1">Conflict Avoidance</div>
              <div className="text-xs text-gray-400">No back-to-back matches for teams</div>
            </div>

            <div className="bg-surface-elevated rounded-lg p-3 border border-gray-600">
              <div className="font-medium text-white text-sm mb-1">Flexible Timing</div>
              <div className="text-xs text-gray-400">Adjustable match duration and breaks</div>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};

