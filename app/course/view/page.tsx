"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const CourseViewPage = dynamic(() => import("./CourseViewPage"), {
  ssr: false,
});

export default function CourseViewWrapper() {
  return (
    <Suspense fallback={<div className="text-center mt-20">📘 Loading...</div>}>
      <CourseViewPage />
    </Suspense>
  );
}

