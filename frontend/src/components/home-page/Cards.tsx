"use client";

import { useSpring, animated } from "@react-spring/web";
import edu from "/public/assets/cards/education.jpg";
import guide from "/public/assets/cards/guidance.png";
import mental from "/public/assets/cards/mental.jpg";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { useUser } from "@clerk/nextjs";

const Card = ({
  title,
  description,
  image,
  link,
}: {
  title: string;
  description: string;
  image: StaticImageData;
  link: string;
}) => {
  const [props, api] = useSpring(() => ({
    transform: "scale(1)",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
    config: { tension: 210, friction: 20 },
  }));

  return (
    <Link href={link} className="w-full md:w-1/5" aria-label={title}>
      <animated.div
        className="bg-gray-900 h-[80vh] text-white rounded-lg overflow-hidden shadow-lg transition-transform duration-75 transform hover:scale-105"
        style={props}
        onMouseEnter={() => api.start({ transform: "scale(1.05)" })}
        onMouseLeave={() => api.start({ transform: "scale(1)" })}
      >
        <Image src={image} alt={title} className="object-cover w-full h-2/3" />
        <div className="p-4">
          <h3 className="mb-2 text-xl font-semibold">{title}</h3>
          <p>{description}</p>
        </div>
      </animated.div>
    </Link>
  );
};

const Cards = () => {
  const { user } = useUser();
  const role = user?.unsafeMetadata?.role;

  const data = [
    {
      id: 1,
      title: "Education",
      description: "Explore educational resources and opportunities.",
      image: edu,
      link: "/education",
    },
    {
      id: 2,
      title: "Counseling",
      description: "Access counseling services and support.",
      image: guide,
      link: "/counseling",
    },
    {
      id: 3,
      title: "AI Chatbot",
      description: "Get instant answers and emotional support from our AI.",
      image: mental,
      link: "/chatbot",
    },
  ];

  if (role !== "councellor") {
    data.unshift({
      id: 4,
      title: "Book a Session",
      description: "Find a counselor to guide your journey.",
      image: mental,
      link: "/book",
    });
  } else if (role === "councellor") {
    data.unshift({
      id: 4,
      title: "Your Counseling Dashboard",
      description: "Counsel students and handle your schedule",
      image: mental,
      link: "/mybooking",
    });
  }
  

  return (
    <div className="flex flex-col justify-center gap-10 p-4 md:flex-row md:flex-wrap">
      {data.map((item) => (
        <Card
          key={item.id}
          title={item.title}
          description={item.description}
          image={item.image}
          link={item.link}
        />
      ))}
    </div>
  );
};

export default Cards;
