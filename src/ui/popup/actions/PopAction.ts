import { UserInterface } from "../UserInterface";

export type PopAction = (ui: UserInterface) => void | Promise<void>;
