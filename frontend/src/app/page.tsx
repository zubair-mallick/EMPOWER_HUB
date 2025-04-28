"use client";

import Cards from "@/components/home-page/Cards";
import Chatbot from "@/components/home-page/Chatbot";
import Counseling from "@/components/home-page/Counseling";
import Education from "@/components/home-page/Education";
import HeroSection from "@/components/home-page/HeroSection";
import { useUser } from "@clerk/nextjs";



export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();


  if(user){
  console.log(user!.unsafeMetadata.role)
  }
  

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
