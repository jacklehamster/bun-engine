import React, { ReactNode, useContext } from 'react';
import Context from './Context';
import { GameContextType } from './GameContextType';

interface Props {
  children: ReactNode;
  context: GameContextType;
}

const Provider: React.FC<Props> = ({ children, context }: Props) => {
  return <Context.Provider value={context}>{children}</Context.Provider>;
};

const useGameContext = (): GameContextType => {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useGameContext must be used within a Provider');
  }
  return context;
};

export { Provider, useGameContext };
