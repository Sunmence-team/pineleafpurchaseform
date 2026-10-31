import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";
import TopNav from "../components/navs/TopNav";
import { HiBars3 } from "react-icons/hi2";
import { FaXmark } from "react-icons/fa6";
import Sidebar from "../components/navs/Sidebar";
import { usePageTitle } from "../lib/routeTitles";

type LayoutProps = {
  children?: React.ReactNode;
  pageName?: string;
};

const MainLayout = ({ children, pageName }: LayoutProps) => {
  const location = useLocation();
  const currentTitle = usePageTitle(pageName);

  useEffect(() => {
    document.title = "Pineleaf Forms - " + currentTitle;
  }, [currentTitle]);

  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      x: -20,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 1.0,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 1.0,
        ease: "easeInOut",
      },
    },
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const style = document.createElement("style");
    style.textContent = `
      .main-content {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overflow-anchor: none;
          scroll-padding-top: 80px;
          overscroll-behavior-y: contain;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useLayoutEffect(() => {
    const scrollToTop = () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        if (mainContentRef.current?.scrollTop !== 0) {
          mainContentRef.current?.scrollTo(0, 0);
        }
        if (window.scrollY !== 0) {
          window.scrollTo(0, 0);
        }
      }, 300);
    };

    const rafId = requestAnimationFrame(() => {
      scrollToTop();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex w-full relative! bg-white h-dvh overflow-hidden">
      <div
        className={`lg:w-[20%] z-100 backdrop-blur-sm h-full w-full lg:sticky absolute transition-all duration-500 ${
          isOpen ? "left-0" : "-left-full"
        }`}
      >
        {/* Left Navigation */}
        <button
          type="button"
          className="lg:hidden top-4 lg:left-[70%] md:left-[53%] left-[70%] block absolute text-primary"
          onClick={() => setIsOpen(false)}
        >
          <FaXmark size={30} />
        </button>
        <Sidebar setIsOpen={setIsOpen} />
      </div>
      <div className={`lg:w-[80%] w-full overflow-hidden pt-4 pb-6`}>
        <div className="md:px-6 px-4 flex gap-4 sticky top-0 z-10 items-center border-b border-primary/10">
          <button
            type="button"
            className="lg:hidden inline-block"
            onClick={() => setIsOpen(true)}
          >
            <HiBars3 size={30} />
          </button>
          <TopNav />
        </div>

        <div
          ref={mainContentRef}
          className={`h-[calc(100%-15px)]`}
          style={{
            minHeight: "0",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
          }}
          tabIndex={-1}
        >
          <AnimatePresence mode="wait">
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              style={{
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
              }}
              className="md:px-6 px-4 h-full overflow-y-scroll no-scrollbar py-4"
            >
              {children ? children : <Outlet />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
