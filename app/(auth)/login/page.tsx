"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";
import { SITE_NAME } from "@/lib/utils";

export default function LoginPage() {
	const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;

		async function initAuth() {
			try {
				const { initializeApp, getApps } = await import("firebase/app");
				const res = await fetch("/api/auth/config");
				const config = await res.json();
				const app = getApps().length ? getApps()[0] : initializeApp(config);
				const { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged } =
					await import("firebase/auth");
				const auth = getAuth(app);

				if (auth.currentUser) {
					window.location.replace("/");
					return;
				}

				const unsubscribe = onAuthStateChanged(auth, (user) => {
					if (user && !cancelled) {
						sessionStorage.removeItem("redirect_sent");
						window.location.replace("/");
					}
				});

				try {
					const result = await getRedirectResult(auth);
					if (result?.user && !cancelled) {
						sessionStorage.removeItem("redirect_sent");
						window.location.replace("/");
						return;
					}
				} catch (redirectErr: any) {
					console.warn("[Login] Redirect result error:", redirectErr);
				}

				if (!cancelled && !auth.currentUser) {
					const hasAttempted = sessionStorage.getItem("redirect_sent");
					if (hasAttempted) {
						sessionStorage.removeItem("redirect_sent");
						setStatus("error");
						setError("Unable to complete sign-in. Please try again from the main page.");
					} else {
						sessionStorage.setItem("redirect_sent", "1");
						setStatus("redirecting");
						await signInWithRedirect(auth, new GoogleAuthProvider());
					}
				}

				return () => unsubscribe();
			} catch (err: any) {
				console.error("[Login] Error:", err);
				if (!cancelled) {
					setError(err?.message || "Sign-in failed. Please try again.");
					setStatus("error");
				}
			}
		}

		initAuth();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f4f3ec", gap: "24px", padding: "24px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
			<div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
				<LogoMark size={28} className="text-text-primary" />
				<span style={{ fontSize: "18px", fontWeight: 600, color: "#1c1b18" }}>{SITE_NAME}</span>
			</div>
			{status === "loading" && <p style={{ fontSize: "13px", color: "#6e6c64" }}>Preparing sign-in...</p>}
			{status === "redirecting" && <p style={{ fontSize: "13px", color: "#6e6c64" }}>Redirecting to Google...</p>}
			{status === "error" && (
				<div style={{ textAlign: "center", maxWidth: "340px" }}>
					<p style={{ fontSize: "13px", color: "#dc2626", marginBottom: "16px" }}>{error}</p>
					<Link href="/" style={{ fontSize: "13px", fontWeight: 600, color: "#1c1b18" }}>Back to home</Link>
				</div>
			)}
		</div>
	);
}