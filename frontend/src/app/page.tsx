"use client";

import Cards from "@/components/home-page/Cards";
import Chatbot from "@/components/home-page/Chatbot";
import Counseling from "@/components/home-page/Counseling";
import Education from "@/components/home-page/Education";
import HeroSection from "@/components/home-page/HeroSection";
import './globals.css'



export default function Home() {
  


  return (
    <>
    
      <HeroSection />
      <Cards />
      <Education />
      <Counseling />
      <Chatbot />
    </>
  );
}
