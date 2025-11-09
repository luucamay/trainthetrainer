import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { EDUCATION_VAULT_ABI, USDC_ABI } from '@/abis/VaultABI';
import { CONTRACT_ADDRESSES } from '@/lib/contracts';

export default function AdminDashboard() {
	const [trainerAddress, setTrainerAddress] = useState('');
	const [paymentAmount, setPaymentAmount] = useState('');
	const { address, isConnected, chain } = useAccount();
	const { writeContract, isPending } = useWriteContract();

	// Get current chain addresses (defaulting to Base for now)
	const chainId = chain?.id as keyof typeof CONTRACT_ADDRESSES || 8453;
	const addresses = CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[8453];

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

	// Read USDC balance of education fund
	const { data: fundUsdcBalance } = useReadContract({
		address: addresses.USDC,
		abi: USDC_ABI,
		functionName: 'balanceOf',
		args: [addresses.EDUCATION_FUND],
	}) as { data: bigint | undefined };

	const handleHarvestYield = async () => {
		try {
			writeContract({
				address: addresses.EDUCATION_VAULT,
				abi: EDUCATION_VAULT_ABI,
				functionName: 'harvestYield',
				args: [],
			}, {
				onSuccess: () => {
					toast.success('✅ Yield harvested successfully!');
				},
				onError: (error) => {
					console.error('Harvest error:', error);
					if (error.message.includes('User rejected')) {
						toast.error('❌ Transaction rejected by user');
					} else if (error.message.includes('Ownable')) {
						toast.error('❌ Only contract owner can harvest yield');
					} else if (addresses.EDUCATION_VAULT === '0x1234567890123456789012345678901234567890') {
						toast.error('❌ Contract not deployed yet - this is just UI testing!');
					} else {
						toast.error(`❌ Harvest failed: ${error.message.slice(0, 100)}...`);
					}
				}
			});
			
			toast.info('🔄 Harvesting yield...');
		} catch (error) {
			console.error('Harvest error:', error);
			toast.error('❌ Failed to initiate harvest transaction');
		}
	};

	const handlePayTrainer = async () => {
		if (!trainerAddress || !paymentAmount) {
			toast.error('Please enter trainer address and amount');
			return;
		}

		// Basic address validation
		if (!trainerAddress.startsWith('0x') || trainerAddress.length !== 42) {
			toast.error('Please enter a valid Ethereum address');
			return;
		}

		try {
			const amount = parseUnits(paymentAmount, 6); // USDC has 6 decimals
			
			writeContract({
				address: addresses.EDUCATION_VAULT,
				abi: EDUCATION_VAULT_ABI,
				functionName: 'payTrainer',
				args: [trainerAddress as `0x${string}`, amount],
			}, {
				onSuccess: () => {
					toast.success('✅ Trainer payment successful!');
					setTrainerAddress('');
					setPaymentAmount('');
				},
				onError: (error) => {
					console.error('Payment error:', error);
					if (error.message.includes('User rejected')) {
						toast.error('❌ Transaction rejected by user');
					} else if (error.message.includes('Ownable')) {
						toast.error('❌ Only contract owner can pay trainers');
					} else if (error.message.includes('insufficient')) {
						toast.error('❌ Insufficient funds in education fund');
					} else if (addresses.EDUCATION_VAULT === '0x1234567890123456789012345678901234567890') {
						toast.error('❌ Contract not deployed yet - this is just UI testing!');
					} else {
						toast.error(`❌ Payment failed: ${error.message.slice(0, 100)}...`);
					}
				}
			});
			
			toast.info('🔄 Processing trainer payment...');
		} catch (error) {
			console.error('Payment error:', error);
			toast.error('❌ Failed to initiate payment transaction');
		}
	};

	if (!isConnected) {
		return (
			<div className="container mx-auto min-h-screen px-4 py-12">
				<div className="mx-auto max-w-2xl text-center">
					<h1 className="mb-8 text-4xl font-bold">Admin Dashboard</h1>
					<Card>
						<CardHeader>
							<CardTitle>Connect Your Wallet</CardTitle>
							<CardDescription>
								Connect your wallet to access admin functions
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Please connect your admin wallet to manage the education vault.
							</p>
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
				<h1 className="mb-4 text-4xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">
					Manage the education vault and distribute funds to trainers
				</p>
				<div className="mt-4 flex justify-center items-center gap-2">
					<Badge variant="outline" className="text-sm">
						Admin: {address?.slice(0, 6)}...{address?.slice(-4)}
					</Badge>
					<Badge variant={chain?.id === 11155111 ? "default" : "destructive"} className="text-sm">
						{chain?.name || 'Unknown Network'}
					</Badge>
				</div>
				
				{/* Network Warning */}
				{chain?.id !== 11155111 && chain?.id !== 8453 && (
					<div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
						<p className="text-yellow-800 text-sm">
							⚠️ Please switch to Sepolia testnet or Base network for admin functions
						</p>
					</div>
				)}
				
				{/* Contract Status Warning */}
				{addresses.EDUCATION_VAULT === '0x1234567890123456789012345678901234567890' && (
					<div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
						<p className="text-blue-800 text-sm">
							ℹ️ Currently in UI testing mode - admin functions will show helpful error messages when clicked
						</p>
					</div>
				)}
			</div>

			<Tabs defaultValue="overview" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="harvest">Yield Management</TabsTrigger>
					<TabsTrigger value="payments">Trainer Payments</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
								<Badge variant="secondary">USDC</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{totalDeposited ? formatUnits(totalDeposited as bigint, 6) : '0'}
								</div>
								<p className="text-xs text-muted-foreground">
									Principal amount in vault
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Yield Harvested</CardTitle>
								<Badge variant="secondary" className="text-green-600">
									+{yieldEarned ? formatUnits(yieldEarned as bigint, 6) : '0'}
								</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-green-600">
									{yieldEarned ? formatUnits(yieldEarned as bigint, 6) : '0'}
								</div>
								<p className="text-xs text-muted-foreground">
									Total yield generated
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Education Fund</CardTitle>
								<Badge variant="outline">Available</Badge>
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{fundUsdcBalance ? formatUnits(fundUsdcBalance as bigint, 6) : '0'}
								</div>
								<p className="text-xs text-muted-foreground">
									Ready for trainer payments
								</p>
							</CardContent>
						</Card>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Vault Status</CardTitle>
							<CardDescription>Current state of the education vault</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<Label className="text-sm font-medium">Vault Address</Label>
									<p className="text-xs text-muted-foreground font-mono">
										{addresses.EDUCATION_VAULT}
									</p>
								</div>
								<div>
									<Label className="text-sm font-medium">Education Fund Address</Label>
									<p className="text-xs text-muted-foreground font-mono">
										{addresses.EDUCATION_FUND}
									</p>
								</div>
							</div>
							<Separator />
							<div className="flex justify-between text-sm">
								<span>APY (Estimated):</span>
								<span className="text-green-600">~5.2%</span>
							</div>
							<div className="flex justify-between text-sm">
								<span>Last Harvest:</span>
								<span>2 days ago</span>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Yield Management Tab */}
				<TabsContent value="harvest" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Yield Harvesting</CardTitle>
							<CardDescription>
								Harvest yield from Aave and transfer to education fund
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="rounded-lg bg-muted p-4">
								<h4 className="mb-2 text-sm font-semibold">How Harvesting Works:</h4>
								<ul className="space-y-1 text-sm text-muted-foreground">
									<li>• Yield is automatically generated from Aave deposits</li>
									<li>• Manual harvest transfers all yield to education fund</li>
									<li>• Principal remains in vault for continued yield generation</li>
									<li>• Best practice: Harvest regularly to compound returns</li>
								</ul>
							</div>

							<div className="flex flex-col space-y-2">
								<div className="flex justify-between text-sm">
									<span>Estimated Pending Yield:</span>
									<span className="text-green-600">~0.15 USDC</span>
								</div>
								<div className="flex justify-between text-sm">
									<span>Gas Cost (Estimated):</span>
									<span>~$0.50</span>
								</div>
							</div>

							<Button 
								onClick={handleHarvestYield}
								className="w-full"
								disabled={isPending}
								size="lg"
							>
								{isPending ? 'Harvesting...' : '🌾 Harvest Yield'}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Trainer Payments Tab */}
				<TabsContent value="payments" className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Pay Trainers</CardTitle>
							<CardDescription>
								Distribute education funds to trainers and educators
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="trainer-address">Trainer Address</Label>
								<Input
									id="trainer-address"
									placeholder="0x..."
									value={trainerAddress}
									onChange={(e) => setTrainerAddress(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="payment-amount">Payment Amount (USDC)</Label>
								<Input
									id="payment-amount"
									placeholder="1000"
									value={paymentAmount}
									onChange={(e) => setPaymentAmount(e.target.value)}
									type="number"
									min="0"
									step="0.000001"
								/>
								<div className="flex justify-between text-sm text-muted-foreground">
									<span>Available:</span>
									<span>
										{fundUsdcBalance ? formatUnits(fundUsdcBalance as bigint, 6) : '0'} USDC
									</span>
								</div>
							</div>

							<Button 
								onClick={handlePayTrainer}
								className="w-full"
								disabled={isPending || !trainerAddress || !paymentAmount}
								size="lg"
							>
								{isPending ? 'Processing...' : '💰 Pay Trainer'}
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recent Payments</CardTitle>
							<CardDescription>
								History of trainer payments (mock data)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex justify-between items-center p-3 border rounded">
									<div>
										<p className="font-medium text-sm">0x1234...5678</p>
										<p className="text-xs text-muted-foreground">2 hours ago</p>
									</div>
									<div className="text-right">
										<p className="font-medium">500 USDC</p>
										<p className="text-xs text-muted-foreground">Smart Contract Training</p>
									</div>
								</div>
								
								<div className="flex justify-between items-center p-3 border rounded">
									<div>
										<p className="font-medium text-sm">0x8765...4321</p>
										<p className="text-xs text-muted-foreground">1 day ago</p>
									</div>
									<div className="text-right">
										<p className="font-medium">750 USDC</p>
										<p className="text-xs text-muted-foreground">DeFi Workshop Series</p>
									</div>
								</div>
								
								<div className="flex justify-between items-center p-3 border rounded">
									<div>
										<p className="font-medium text-sm">0x9999...1111</p>
										<p className="text-xs text-muted-foreground">3 days ago</p>
									</div>
									<div className="text-right">
										<p className="font-medium">300 USDC</p>
										<p className="text-xs text-muted-foreground">Beginner Blockchain Course</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}