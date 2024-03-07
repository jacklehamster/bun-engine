import React from 'react';
import { DEFAULT_GAME_CONTEXT, GameContextType } from './GameContextType';

const Context = React.createContext<GameContextType>(DEFAULT_GAME_CONTEXT);
export default Context;
