import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function LoginButton() {
	const { connect, connectors } = useConnect();

	const onClick = async () => {
		await connect({ connector: connectors[0] });
	};

	return <button onClick={onClick}>Login</button>;
}

function LogoutButton() {
	const { disconnect } = useDisconnect();

	const onClick = async () => {
		await disconnect();
	};

	return <button onClick={onClick}>Logout</button>;
}
export function UauthButton() {
	const { address } = useAccount();
	if (address) {
		return <LogoutButton />;
	}
	return <LoginButton />;
}
