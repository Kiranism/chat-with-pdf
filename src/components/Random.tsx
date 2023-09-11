"use client";
import React, { FC } from "react";
import { Button } from "./ui/button";
import { toast, useToast } from "./ui/use-toast";

type RandomProps = {};

const Random: FC<RandomProps> = ({}) => {
  const { toast } = useToast();
  const handleToast = () => {
    toast({ title: "yo waasssup" });
  };
  return (
    <div>
      <Button onClick={handleToast}>Click to toast</Button>
    </div>
  );
};

export default Random;
