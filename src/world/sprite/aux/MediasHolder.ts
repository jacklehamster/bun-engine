import { Media } from "gl/texture/Media";
import { Medias } from "gl/texture/Medias";
import { ElemsHolder } from "./ElemsHolder";

export interface MediasHolder extends Medias, ElemsHolder<Media> {
}
