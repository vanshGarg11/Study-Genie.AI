import { useEffect, useRef, useState } from "react";
import { LIVE2D_TEACHER_MODEL_PATH } from "../config/live2dTeacher";

declare global {
  interface Window {
    PIXI?: unknown;
    Live2DCubismCore?: unknown;
  }
}

interface Live2DTeacherProps {
  speaking: boolean;
}

type TeacherStatus = "loading" | "ready" | "failed";

function FallbackTeacher({
  speaking,
  label,
}: {
  speaking: boolean;
  label: string;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end overflow-hidden bg-[radial-gradient(circle_at_top,#233554_0,#0E1116_55%)] px-6 pb-8">
      <div className="relative h-[370px] w-[230px]">
        <div className="absolute left-1/2 top-7 h-36 w-36 -translate-x-1/2 rounded-full border border-[#3B465C] bg-[#F0C6AE]" />
        <div className="absolute left-1/2 top-3 h-28 w-40 -translate-x-1/2 rounded-t-full bg-[#E9ECEF]" />
        <div className="absolute left-[76px] top-[92px] h-4 w-8 rounded-full bg-[#254B58]" />
        <div className="absolute right-[76px] top-[92px] h-4 w-8 rounded-full bg-[#254B58]" />
        <div
          className={`absolute left-1/2 top-[136px] h-3 w-8 -translate-x-1/2 rounded-full bg-[#B44A5C] ${
            speaking ? "teacher-mouth" : ""
          }`}
        />
        <div className="absolute bottom-0 left-1/2 h-52 w-52 -translate-x-1/2 rounded-t-[90px] border border-[#334054] bg-[#1C3150]" />
        <div className="absolute bottom-24 left-1/2 h-24 w-16 -translate-x-1/2 bg-[#F0C6AE]" />
        <div className="absolute bottom-0 left-1/2 h-44 w-40 -translate-x-1/2 rounded-t-[70px] bg-[#203C63]" />
      </div>

      <div className="mt-4 border border-[#2D3545] bg-[#0B0E13]/90 px-4 py-2 text-center">
        <p className="sg-mono text-[10px] uppercase tracking-[0.18em] text-[#8B92A3]">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Live2DTeacher({
  speaking,
}: Live2DTeacherProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const modelRef = useRef<any>(null);
  const appRef = useRef<any>(null);
  const [status, setStatus] = useState<TeacherStatus>("loading");

  useEffect(() => {
    let disposed = false;

    const loadModel = async () => {
      if (!hostRef.current) return;

      try {
        const PIXI = await import("pixi.js");
        window.PIXI = PIXI;
        const { Live2DModel } = await import("pixi-live2d-display/cubism4");

        if (disposed || !hostRef.current) return;

        const app = new (PIXI as any).Application({
          width: 360,
          height: 520,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
        });

        appRef.current = app;
        hostRef.current.innerHTML = "";
        hostRef.current.appendChild(app.view as HTMLCanvasElement);

        const model = await Live2DModel.from(
          LIVE2D_TEACHER_MODEL_PATH
        );

        if (disposed) {
          model.destroy();
          return;
        }

        model.anchor.set(0.5, 0.5);
        model.position.set(180, 285);
        model.scale.set(0.34);
        modelRef.current = model;
        app.stage.addChild(model);
        setStatus("ready");
      } catch (error) {
        console.error("Live2D teacher failed to load", error);
        setStatus("failed");
      }
    };

    loadModel();

    return () => {
      disposed = true;
      modelRef.current?.destroy?.();
      appRef.current?.destroy(true, {
        children: true,
        texture: false,
        baseTexture: false,
      });
      modelRef.current = null;
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    const model = modelRef.current;
    const ticker = appRef.current?.ticker;
    if (!model || !ticker) return;

    let frame = 0;
    const animateMouth = () => {
      frame += 0.32;
      const value = speaking ? 0.25 + Math.abs(Math.sin(frame)) * 0.75 : 0;
      model.internalModel?.coreModel?.setParameterValueById?.(
        "ParamMouthOpenY",
        value
      );
    };

    ticker.add(animateMouth);

    return () => {
      ticker.remove(animateMouth);
      model.internalModel?.coreModel?.setParameterValueById?.(
        "ParamMouthOpenY",
        0
      );
    };
  }, [speaking]);

  return (
    <div className="relative h-full w-full">
      <div ref={hostRef} className="absolute inset-0 flex items-center justify-center" />
      {status === "loading" && (
        <FallbackTeacher speaking={speaking} label="Loading Live2D teacher" />
      )}
      {status === "failed" && (
        <FallbackTeacher speaking={speaking} label="Fallback teacher active" />
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 border border-[#22C58B]/40 bg-[#0E1116]/85 text-[#22C58B] text-[10px] uppercase tracking-[0.2em]">
        {speaking ? "Speaking" : status === "ready" ? "Ready" : "Loading"}
      </div>
    </div>
  );
}
