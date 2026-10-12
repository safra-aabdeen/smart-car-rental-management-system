import mercedesLuxuryImg from "../images/mercedes_benzLP.jpg";
import nissanSylphyImg from "../images/Nissan-SylphyBU.jpg";
import daihatsuMiraImg from "../images/daihatsu-miraBE.jpg";
import hondaShuttleImg from "../images/Honda-ShuttleFBF.webp";
import toyotaRaizeImg from "../images/Toyota-RaizeFBF.webp";
import hyundaiTucsonImg from "../images/Hyundai-TucsonFSUV.jpg";
import toyotaPremioImg from "../images/Toyota-PremioBU.png";
import audiA6Img from "../images/audi-a6LP.avif";
import mercedesBenzImg from "../images/Mercedes-Benz-LPF.jpeg";
import landCruiserImg from "../images/Toyota-land-cruiserLP.jpg";
import rangeRoverImg from "../images/range-roverLP.avif";
import bmw5SeriesImg from "../images/bmw-5-seriesLP.jpg";
import audiImg from "../images/BMW-X5LPF.jpg";
import hondaImg from "../images/Honda_CivicBU.jpg";
import toyotaImg from "../images/Toyota-PradoFSUV.jpg";
import hondaGraceImg from "../images/Honda-GraceBU.jpg";
import toyotaCorollaImg from "../images/Toyota-corollaBU.jpg";
import hondaFitzImg from "../images/Honda-FitzBE.jpg";
import toyotaVitzImg from "../images/Toyota-VitzBE.jpg";
import suzukiAltoImg from "../images/Suzuki-AltoBE.avif";
import toyotaNoahImg from "../images/Toyota-NoahBUU.jpg";
import suzukiErtigaImg from "../images/suzuki-ertigaFBF.webp";
import kiaSportageImg from "../images/Kia-sportageFSUV.avif";
import monteroImg from "../images/mitsubishi_monteroFSUV.jpg";

const cars = [
  {
    id: 1,
    name: "Mercedes Benz",
    price: 12000,
    rating: 4.9,
    type: "Luxury",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: mercedesLuxuryImg,
  },

  {
    id: 2,
    name: "Nissan Sylphy",
    price: 7000,
    rating: 4.5,
    type: "Sedan",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: nissanSylphyImg,
  },

  {
    id: 3,
    name: "Daihatsu Mira",
    price: 4000,
    rating: 4.3,
    type: "Economy",
    seats: 4,
    fuel: "Petrol",
    available: true,
    image: daihatsuMiraImg,
  },

  {
    id: 4,
    name: "Honda Shuttle",
    price: 8000,
    rating: 4.6,
    type: "Family",
    seats: 7,
    fuel: "Hybrid",
    available: true,
    image: hondaShuttleImg,
  },

  {
    id: 5,
    name: "Toyota Raize",
    price: 10000,
    rating: 4.7,
    type: "SUV",
    seats: 5,
    fuel: "Hybrid",
    available: false,
    image: toyotaRaizeImg,
  },

  {
    id: 6,
    name: "Hyundai Tucson",
    price: 12000,
    rating: 4.8,
    type: "SUV",
    seats: 5,
    fuel: "Diesel",
    available: true,
    image: hyundaiTucsonImg,
  },

  {
    id: 7,
    name: "Toyota Premio",
    price: 8000,
    rating: 4.4,
    type: "Sedan",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: toyotaPremioImg,
  },

  {
    id: 8,
    name: "Audi A6",
    price: 12000,
    rating: 5.0,
    type: "Luxury",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: audiA6Img,
  },

  {
    id: 9,
    name: "Mercedes-Benz LPF",
    price: 12000,
    rating: 4.9,
    type: "Luxury",
    seats: 5,
    fuel: "Petrol",
    available: false,
    image: mercedesBenzImg,
  },

  {
    id: 10,
    name: "Toyota Land Cruiser",
    price: 8000,
    rating: 5.0,
    type: "SUV",
    seats: 7,
    fuel: "Diesel",
    available: false,
    image: landCruiserImg,
  },

  {
    id: 11,
    name: "Range Rover",
    price: 12000,
    rating: 5.0,
    type: "Luxury",
    seats: 7,
    fuel: "Petrol",
    available: true,
    image: rangeRoverImg,
  },

  {
    id: 12,
    name: "BMW 5 Series",
    price: 12000,
    rating: 4.9,
    type: "Luxury",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: bmw5SeriesImg,
  },

  {
    id: 13,
    name: "BMW X5",
    price: 12000,
    rating: 4.8,
    type: "SUV",
    seats: 7,
    fuel: "Petrol",
    available: true,
    image: audiImg,
  },

  {
    id: 14,
    name: "Honda Civic",
    price: 7500,
    rating: 4.7,
    type: "Sedan",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: hondaImg,
  },

  {
    id: 15,
    name: "Toyota Prado",
    price: 12000,
    rating: 4.8,
    type: "SUV",
    seats: 7,
    fuel: "Diesel",
    available: false,
    image: toyotaImg,
  },

  {
    id: 16,
    name: "Honda Grace",
    price: 6500,
    rating: 4.5,
    type: "Sedan",
    seats: 5,
    fuel: "Hybrid",
    available: true,
    image: hondaGraceImg,
  },

  {
    id: 17,
    name: "Toyota Corolla",
    price: 7000,
    rating: 4.6,
    type: "Sedan",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: toyotaCorollaImg,
  },

  {
    id: 18,
    name: "Honda Fitz",
    price: 5500,
    rating: 4.3,
    type: "Economy",
    seats: 5,
    fuel: "Hybrid",
    available: true,
    image: hondaFitzImg,
  },

  {
    id: 19,
    name: "Toyota Vitz",
    price: 5000,
    rating: 4.2,
    type: "Economy",
    seats: 5,
    fuel: "Petrol",
    available: true,
    image: toyotaVitzImg,
  },

  {
    id: 20,
    name: "Suzuki Alto",
    price: 7000,
    rating: 4.1,
    type: "Economy",
    seats: 4,
    fuel: "Petrol",
    available: true,
    image: suzukiAltoImg,
  },

  {
    id: 21,
    name: "Toyota Noah",
    price: 11000,
    rating: 4.7,
    type: "Family",
    seats: 8,
    fuel: "Hybrid",
    available: true,
    image: toyotaNoahImg,
  },

  {
    id: 22,
    name: "Suzuki Ertiga",
    price: 8500,
    rating: 4.6,
    type: "Family",
    seats: 7,
    fuel: "Petrol",
    available: true,
    image: suzukiErtigaImg,
  },

  {
    id: 23,
    name: "Kia Sportage",
    price: 12000,
    rating: 4.8,
    type: "SUV",
    seats: 5,
    fuel: "Diesel",
    available: true,
    image: kiaSportageImg,
  },

  {
    id: 24,
    name: "Mitsubishi Montero",
    price: 12000,
    rating: 4.9,
    type: "SUV",
    seats: 7,
    fuel: "Diesel",
    available: true,
    image: monteroImg,
  },
];

export default cars;