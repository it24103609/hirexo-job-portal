// Frontend Components for Premium Features
// Place these in: frontend/src/components/Premium/

// 1. SubscriptionPlans.jsx
export const SubscriptionPlans = () => {
  const plans = [
    {
      tier: 'FREE',
      title: 'Free',
      price: '₹0',
      description: 'Perfect for getting started',
      features: [
        '2 job posts/month',
        'Basic job listings',
        'No featured jobs',
        'Email support'
      ],
      cta: 'Current Plan',
      disabled: true
    },
    {
      tier: 'BASIC',
      title: 'Basic',
      price: '₹999',
      description: 'Great for growing teams',
      features: [
        '10 job posts/month',
        '2 featured jobs',
        'Basic analytics',
        'Priority email support',
        'Job recommendations'
      ],
      cta: 'Upgrade Now',
      highlighted: false
    },
    {
      tier: 'PROFESSIONAL',
      title: 'Professional',
      price: '₹2,999',
      description: 'Most popular for teams',
      features: [
        '50 job posts/month',
        '10 featured jobs',
        'Advanced analytics',
        'Candidate screening',
        'Bulk hiring tools',
        '24/7 phone support'
      ],
      cta: 'Upgrade Now',
      highlighted: true
    },
    {
      tier: 'ENTERPRISE',
      title: 'Enterprise',
      price: '₹9,999',
      description: 'For large organizations',
      features: [
        'Unlimited job posts',
        '50 featured jobs',
        'Full analytics suite',
        'Advanced screening AI',
        'Dedicated account manager',
        'Custom integrations'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  const handleUpgrade = (tier) => {
    window.location.href = `/subscribe?tier=${tier}`;
  };

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the perfect plan for your hiring needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105 ${
                plan.highlighted ? 'ring-2 ring-blue-500 transform scale-105' : ''
              } ${plan.tier === 'FREE' ? 'bg-white' : 'bg-white'}`}
            >
              {plan.highlighted && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900">{plan.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{plan.description}</p>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                <button
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={plan.disabled}
                  className={`w-full mt-6 py-2 px-4 rounded-lg font-semibold transition ${
                    plan.disabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-600">
                      <svg
                        className="w-4 h-4 mr-3 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. PaymentCheckout.jsx
export const PaymentCheckout = ({ tier, role, billingCycle = 'MONTHLY' }) => {
  const [loading, setLoading] = React.useState(false);
  const [orderId, setOrderId] = React.useState(null);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post('/api/payments/subscription/initialize', {
        tier,
        role,
        billingCycle
      });

      const { orderId, amount, razorpayKeyId } = response.data.data;
      setOrderId(orderId);

      // Initialize Razorpay
      const options = {
        key: razorpayKeyId,
        amount,
        currency: 'INR',
        order_id: orderId,
        handler: handlePaymentSuccess,
        prefill: {
          email: localStorage.getItem('userEmail'),
          contact: localStorage.getItem('userPhone')
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Verify payment
      const verifyResponse = await axiosInstance.post('/api/payments/subscription/verify', {
        razorpayOrderId: response.order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        tier,
        role,
        billingCycle
      });

      toast.success('Payment successful! Subscription activated.');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Payment verification failed');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Complete Your Subscription</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Plan: <span className="font-semibold">{tier}</span></p>
        <p className="text-gray-600">Billing: <span className="font-semibold">{billingCycle}</span></p>
        <p className="text-lg font-bold mt-2">
          Amount: ₹{tier === 'BASIC' ? 999 : tier === 'PROFESSIONAL' ? 2999 : 9999}
        </p>
      </div>

      <button
        onClick={initializePayment}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Payments processed securely by Razorpay
      </p>
    </div>
  );
};

// 3. AnalyticsDashboard.jsx
export const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState(7);

  React.useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      const response = await axiosInstance.get(`/api/premium/analytics?days=${days}`);
      setAnalytics(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Job Views */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Job Views</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.values(analytics).reduce((sum, day) => sum + (day.JOB_VIEW || 0), 0)}
            </p>
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Job Saves */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Job Saves</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.values(analytics).reduce((sum, day) => sum + (day.JOB_SAVE || 0), 0)}
            </p>
          </div>
          <div className="bg-green-100 rounded-full p-3">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Applications</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.values(analytics).reduce((sum, day) => sum + (day.JOB_APPLY || 0), 0)}
            </p>
          </div>
          <div className="bg-purple-100 rounded-full p-3">
            <svg className="w-6 h-6 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. CandidateVerification.jsx
export const CandidateVerification = () => {
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/premium/verification/status');
      setStatus(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    try {
      await axiosInstance.post('/api/premium/verification/verify-email');
      toast.success('Email verification sent!');
      fetchVerificationStatus();
    } catch (error) {
      toast.error('Failed to verify email');
    }
  };

  if (loading) return <div>Loading verification status...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Profile Verification</h2>

      <div className="space-y-4">
        {/* Email Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900">Email Verification</p>
            <p className="text-sm text-gray-600">
              {status?.emailVerified ? '✓ Verified' : 'Not verified'}
            </p>
          </div>
          {!status?.emailVerified && (
            <button
              onClick={verifyEmail}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Verify
            </button>
          )}
        </div>

        {/* Phone Verification */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900">Phone Verification</p>
            <p className="text-sm text-gray-600">
              {status?.phoneVerified ? '✓ Verified' : 'Not verified'}
            </p>
          </div>
          {!status?.phoneVerified && (
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Verify
            </button>
          )}
        </div>

        {/* Verification Score */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-900">Verification Score</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${status?.verificationScore || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {status?.verificationScore || 0}% Complete
            {status?.verificationBadge && (
              <span className="ml-2 inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                ✓ Badge Earned
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
