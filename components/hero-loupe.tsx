"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function HeroLoupe() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 0.4], [0, -90]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0.2, 1]);
  return (
    <div className="relative min-h-[500px] overflow-hidden rounded border border-[#191714]/30 bg-[#F8F0DF] p-5 shadow-[12px_12px_0_rgba(25,23,20,0.12)]">
      <motion.div style={{ y }} className="archive-paper h-[640px] border border-[#191714]/20 p-8">
        <p className="mono text-xs uppercase tracking-widest text-[#315B9A]">Accession 1908-POR-17</p>
        <h2 className="display mt-8 text-5xl font-semibold">Notice to Harbor Carriers</h2>
        {["North gate opens at six bells", "Lamp oil: twelve tins received", "Ledger mark verified by clerk", "Filed for public municipal record"].map((line) => (
          <p key={line} className="mono mt-7 border-b border-[#191714]/25 pb-2 text-lg">{line}</p>
        ))}
      </motion.div>
      <motion.div
        style={{ opacity }}
        className="absolute left-[18%] top-[26%] grid h-52 w-52 place-items-center rounded-full border-4 border-[#315B9A] bg-[#efe4cf]/45 shadow-[0_0_0_999px_rgba(25,23,20,0.12)] backdrop-brightness-110"
      >
        <div className="rounded bg-[#191714] px-3 py-2 text-sm font-bold text-[#EFE4CF]">date: June 5 1893</div>
      </motion.div>
      <div className="stamp absolute bottom-8 right-8 px-4 py-2 font-black">hash checked</div>
    </div>
  );
}

