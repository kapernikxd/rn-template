import { BASE_URL } from "../http";
import { isEmpty } from "./common";


export const getImagesPath = (images: any[]) =>
  images && !isEmpty(images)
    ? images.map((image) => BASE_URL + "images/" + image.path)
    : [];

export const getImagesParticipantsPath = (images: any[]) =>
  images && !isEmpty(images)
    ? images.map((image) => BASE_URL + "images/" + image.avatarFile)
    : [];

export const getImagePath = (image: any) => {
  if(image){
    return BASE_URL + "images/" + image.path;
  }
}