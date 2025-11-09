import { useState } from 'react';
import { Link } from 'react-router';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { USDC_ABI, EDUCATION_VAULT_ABI } from '@/abis/VaultABI';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';

export default function EducationVault() {
	const [depositAmount, setDepositAmount] = useState('');
	const { address, isConnected, chain } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const { writeContract, isPending } = useWriteContract();

	// Get current chain addresses (defaulting to Base for now)
	const chainId = chain?.id as keyof typeof CONTRACT_ADDRESSES || 8453;
	const addresses = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[8453];

	// Read USDC balance
	const { data: usdcBalance } = useReadContract({
		address: addresses.USDC,
		abi: USDC_ABI,
		functionName: 'balanceOf',
		args: address ? [address] : undefined,
	}) as { data: bigint | undefined };

	// Read USDC allowance
	const { data: usdcAllowance } = useReadContract({
		address: addresses.USDC,
		abi: USDC_ABI,
		functionName: 'allowance',
		args: address ? [address, addresses.EDUCATION_VAULT] : undefined,
	}) as { data: bigint | undefined };

	// Read vault stats
	const { data: totalDeposited } = useReadContract({
		address: addresses.EDUCATION_VAULT,
		abi: EDUCATION_VAULT_ABI,
		functionName: 'getTotalDeposited',
	}) as { data: bigint | undefined };

	const { data: yieldEarned } = useReadContract({
		address: addresses.EDUCATION_VAULT,
		abi: EDUCATION_VAULT_ABI,
		functionName: 'getYieldEarned',
	}) as { data: bigint | undefined };

	const { data: educationFundBalance } = useReadContract({
		address: addresses.EDUCATION_VAULT,
		abi: EDUCATION_VAULT_ABI,
		functionName: 'getEducationFundBalance',
	}) as { data: bigint | undefined };

	const handleApproveUSDC = async () => {
		if (!depositAmount) {
			toast.error('Please enter a deposit amount');
			return;
		}

		try {
			const amount = parseUnits(depositAmount, 6); // USDC has 6 decimals
			
			writeContract({
				address: addresses.USDC,
				abi: USDC_ABI,
				functionName: 'approve',
				args: [addresses.EDUCATION_VAULT, amount],
			}, {
				onSuccess: () => {
					toast.success('✅ USDC approval successful!');
				},
				onError: (error) => {
					console.error('Approval error:', error);
					if (error.message.includes('User rejected')) {
						toast.error('❌ Transaction rejected by user');
					} else if (error.message.includes('insufficient funds')) {
						toast.error('❌ Insufficient ETH for gas fees');
					} else if (addresses.EDUCATION_VAULT === '0x1234567890123456789012345678901234567890') {
						toast.error('❌ Contract not deployed yet - this is just UI testing!');
					} else {
						toast.error(`❌ Approval failed: ${error.message.slice(0, 100)}...`);
					}
				}
			});
			
			toast.info('🔄 USDC approval transaction sent...');
		} catch (error) {
			console.error('Approval error:', error);
			toast.error('❌ Failed to initiate approval transaction');
		}
	};

	const handleDeposit = async () => {
		if (!depositAmount) {
			toast.error('Please enter a deposit amount');
			return;
		}

		try {
			const amount = parseUnits(depositAmount, 6); // USDC has 6 decimals
			
			writeContract({
				address: addresses.EDUCATION_VAULT,
				abi: EDUCATION_VAULT_ABI,
				functionName: 'deposit',
				args: [amount],
			}, {
				onSuccess: () => {
					toast.success('✅ Deposit successful! USDC added to vault');
					setDepositAmount(''); // Clear the input after successful deposit
				},
				onError: (error) => {
					console.error('Deposit error:', error);
					if (error.message.includes('User rejected')) {
						toast.error('❌ Transaction rejected by user');
					} else if (error.message.includes('insufficient funds')) {
						toast.error('❌ Insufficient USDC or ETH for gas');
					} else if (addresses.EDUCATION_VAULT === '0x1234567890123456789012345678901234567890') {
						toast.error('❌ Contract not deployed yet - this is just UI testing!');
					} else {
						toast.error(`❌ Deposit failed: ${error.message.slice(0, 100)}...`);
					}
				}
			});
			
			toast.info('🔄 Deposit transaction sent...');
		} catch (error) {
			console.error('Deposit error:', error);
			toast.error('❌ Failed to initiate deposit transaction');
		}
	};

	const needsApproval = () => {
		if (!depositAmount || !usdcAllowance) return false;
		const amount = parseUnits(depositAmount, 6);
		return (usdcAllowance as bigint) < amount;
	};

	if (!isConnected) {
		return (
			<div className="container mx-auto min-h-screen px-4 py-12">
				<div className="mx-auto max-w-2xl text-center">
					<h1 className="mb-8 text-4xl font-bold">Education Vault</h1>
					<Card>
						<CardHeader>
							<CardTitle>Connect Your Wallet</CardTitle>
							<CardDescription>
								Connect your wallet to start depositing USDC for education funding
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{connectors.map((connector) => (
								<Button
									key={connector.uid}
									onClick={() => connect({ connector })}
									className="w-full"
									variant="outline"
								>
									Connect {connector.name}
								</Button>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto min-h-screen space-y-8 px-4 py-12">
			{/* Header */}
			<div className="text-center">
				<h1 className="mb-4 text-4xl font-bold">Education Vault</h1>
				<p className="text-muted-foreground">
					Deposit USDC to earn yield that funds education initiatives
				</p>
				<div className="mt-4 flex justify-center items-center gap-2">
					<Badge variant="outline" className="text-sm">
						Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
					</Badge>
					<Badge variant={chain?.id === 11155111 ? "default" : "destructive"} className="text-sm">
						{chain?.name || 'Unknown Network'}
					</Badge>
					<Button onClick={() => disconnect()} variant="ghost" size="sm" className="ml-2">
						Disconnect
					</Button>
				</div>
				
				{/* Network Warning */}
				{chain?.id !== 11155111 && chain?.id !== 8453 && (
					<div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
						<p className="text-yellow-800 text-sm">
							⚠️ Please switch to Sepolia testnet or Base network for testing
						</p>
					</div>
				)}
				
				{/* Contract Status Warning */}
				{addresses.EDUCATION_VAULT === '0x1234567890123456789012345678901234567890' && (
					<div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
						<p className="text-blue-800 text-sm">
							ℹ️ Currently in UI testing mode - contracts not deployed yet. Transactions will fail but UI works perfectly!
						</p>
					</div>
				)}
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				{/* Deposit Section */}
				<Card>
					<CardHeader>
						<CardTitle>Deposit USDC</CardTitle>
						<CardDescription>
							Your deposits will be put to work in Aave to generate yield for education
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="amount">Amount (USDC)</Label>
							<Input
								id="amount"
								placeholder="1000"
								value={depositAmount}
								onChange={(e) => setDepositAmount(e.target.value)}
								type="number"
								min="0"
								step="0.000001"
							/>
							<div className="flex justify-between text-sm text-muted-foreground">
								<span>Balance:</span>
								<span>
									{usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0'} USDC
								</span>
							</div>
						</div>

						<div className="space-y-2">
							{needsApproval() ? (
								<Button 
									onClick={handleApproveUSDC} 
									className="w-full"
									disabled={isPending}
								>
									{isPending ? 'Approving...' : 'Approve USDC'}
								</Button>
							) : (
								<Button 
									onClick={handleDeposit} 
									className="w-full"
									disabled={isPending || !depositAmount}
								>
									{isPending ? 'Depositing...' : 'Deposit'}
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Vault Stats */}
				<Card>
					<CardHeader>
						<CardTitle>Vault Statistics</CardTitle>
						<CardDescription>
							Current vault performance and education fund status
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex justify-between">
								<span className="text-sm font-medium">Total Deposited:</span>
								<span className="text-sm">
									{totalDeposited ? formatUnits(totalDeposited as bigint, 6) : '0'} USDC
								</span>
							</div>
							<Separator />
							<div className="flex justify-between">
								<span className="text-sm font-medium">Yield Earned:</span>
								<span className="text-sm text-green-600">
									+{yieldEarned ? formatUnits(yieldEarned as bigint, 6) : '0'} USDC
								</span>
							</div>
							<Separator />
							<div className="flex justify-between">
								<span className="text-sm font-medium">Education Fund:</span>
								<span className="text-sm font-bold">
									{educationFundBalance ? formatUnits(educationFundBalance as bigint, 6) : '0'} USDC
								</span>
							</div>
						</div>

						<div className="mt-6 rounded-lg bg-muted p-4">
							<h4 className="mb-2 text-sm font-semibold">How it works:</h4>
							<ul className="space-y-1 text-xs text-muted-foreground">
								<li>• Your USDC is deposited into Aave</li>
								<li>• Yield is automatically harvested</li>
								<li>• All yield goes to the Education Fund</li>
								<li>• Admins manually distribute to trainers</li>
							</ul>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Admin Section (TODO: Add role-based access) */}
			<Card>
				<CardHeader>
					<CardTitle>Admin Functions</CardTitle>
					<CardDescription>
						Administrative controls for vault management
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2">
						<Button 
							variant="outline" 
							onClick={() => {
								// TODO: Implement harvest yield function
								toast.info('Harvest yield functionality coming soon');
							}}
						>
							Harvest Yield
						</Button>
						<Link to="/admin">
							<Button variant="outline" className="w-full">
								Admin Dashboard
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}