import React, { createContext, useState, useContext, ReactNode } from 'react';

interface TeamContextType {
  selectedTeams: string[];
  setSelectedTeams: (teams: string[]) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  return (
    <TeamContext.Provider value={{ selectedTeams, setSelectedTeams }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeams must be used within a TeamProvider');
  }
  return context;
};
