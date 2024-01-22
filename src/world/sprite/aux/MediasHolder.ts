import { Media } from "gl/texture/Media";
import { ElemsHolder } from "./ElemsHolder";
import { UpdatableList } from "../UpdatableList";

export interface MediasHolder extends UpdatableList<Media>, ElemsHolder<Media> {
}
