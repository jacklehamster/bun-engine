import { UserInterface } from "ui/UserInterface";


export type PopAction = (ui: UserInterface) => void | Promise<void>;
