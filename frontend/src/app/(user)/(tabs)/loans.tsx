import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  useColorScheme,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/src/constants/Colors";
import { useAuth } from "@/src/providers/AuthProvider";
import { supabase } from "@/src/lib/supabase";
import { useRealtimeSubscription } from "@/src/lib/useRealTimeSubscription";
import { Loan } from "@/assets/data/types";

const LoanPage = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const { user } = useAuth();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'rejected'>('active');

  const fetchLoans = useCallback(async () => {
    if (!user?.customer_id) return;

    try {
      const { data, error } = await supabase
        .from('Loan')
        .select('*')
        .eq('customer_id', user.customer_id)
        .order('application_date', { ascending: false });

      if (error) {
        console.error('Error fetching loans:', error);
        return;
      }

      setLoans(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.customer_id]);

  const handleLoanChange = useCallback((payload: any) => {
    console.log('Loan change received:', payload);
    fetchLoans();
  }, [fetchLoans]);

  useRealtimeSubscription(
    'Loan',
    handleLoanChange,
    '*',
    !!user
  );

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
  }, [user, fetchLoans]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLoans();
  }, [fetchLoans]);

  // Get loan status based on final_approval
  const getLoanStatus = (loan: Loan): string => {
    if (loan.final_approval === null) return 'Pending';
    if (loan.final_approval === true) return 'Approved';
    if (loan.final_approval === false) return 'Rejected';
    return 'Unknown';
  };

  // Filter loans based on active tab
  const filteredLoans = loans.filter(loan => {
    const status = getLoanStatus(loan);
    switch (activeTab) {
      case 'active':
        return status === 'Approved';
      case 'pending':
        return status === 'Pending';
      case 'rejected':
        return status === 'Rejected';
      default:
        return true;
    }
  });

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved':
      return isDarkMode ? 'lightgreen' : 'green';
    case 'Pending':
      return 'orange';
    case 'Rejected':
      return 'red';
    default:
      return 'gray';
  }
};

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApplyForLoan = () => {
    router.push('/newLoan');
  };

//   const handleLoanDetails = (loanId: number) => {
//     router.push({
//       pathname: '/loanDetails',
//       params: { loan_id: loanId.toString() }
//     });
//   };

  const getLoanIntentDisplay = (intent: string | null) => {
    if (!intent) return 'Personal Loan';
    
    const intentMap: { [key: string]: string } = {
      'PERSONAL': 'Personal Loan',
      'MEDICAL': 'Medical Loan',
      'VENTURE': 'Business Loan',
      'HOMEIMPROVEMENT': 'Home Improvement',
      'DEBTCONSOLIDATION': 'Debt Consolidation',
      'EDUCATION': 'Education Loan'
    };
    
    return intentMap[intent] || intent;
  };

  const renderLoanCard = (loan: Loan) => {
    const status = getLoanStatus(loan);
    
    return (
      <TouchableOpacity
        key={loan.loan_id}
        style={[
          styles.loanCard,
          {
            backgroundColor: isDarkMode ? Colors.dark.firstButton : Colors.light.background,
            borderColor: isDarkMode ? Colors.dark.border : Colors.light.border,
          }
        ]}
        // onPress={() => handleLoanDetails(loan.loan_id)}
      >
        <View style={styles.loanCardHeader}>
          <View style={styles.loanTypeContainer}>
            <MaterialIcons
              name="account-balance"
              size={24}
              color={isDarkMode ? Colors.dark.text : Colors.light.themeColor}
            />
            <Text
              style={[
                styles.loanType,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text }
              ]}
            >
              {getLoanIntentDisplay(loan.loan_intent)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { borderColor: getStatusColor(status) }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(status) }
              ]}
            >
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.loanCardBody}>
          <View style={styles.amountRow}>
            <Text
              style={[
                styles.amountLabel,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text }
              ]}
            >
              Loan Amount
            </Text>
            <Text
              style={[
                styles.amountValue,
                { color: isDarkMode ? Colors.dark.themeColorSecondary : Colors.light.themeColor }
              ]}
            >
              {formatCurrency(loan.loan_amount)}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text }
                ]}
              >
                Interest Rate
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text }
                ]}
              >
                {loan.loan_interest_rate ? `${loan.loan_interest_rate}%` : 'TBD'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text
                style={[
                  styles.detailLabel,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text }
                ]}
              >
                Grade
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text }
                ]}
              >
                {loan.loan_grade || 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Text
              style={[
                styles.dateLabel,
                { color: isDarkMode ? Colors.dark.text : Colors.light.text }
              ]}
            >
              Applied: {formatDate(loan.application_date)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="account-balance"
        size={64}
        color={isDarkMode ? Colors.dark.text + '40' : Colors.light.text + '40'}
      />
      <Text
        style={[
          styles.emptyTitle,
          { color: isDarkMode ? Colors.dark.text : Colors.light.text }
        ]}
      >
        {activeTab === 'active' && 'No Approved Loans'}
        {activeTab === 'pending' && 'No Pending Applications'}
        {activeTab === 'rejected' && 'No Rejected Applications'}
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: isDarkMode ? Colors.dark.text + '80' : Colors.light.text + '80' }
        ]}
      >
        {activeTab === 'active' && 'Your approved loans will appear here'}
        {activeTab === 'pending' && 'Your pending loan applications will appear here'}
        {activeTab === 'rejected' && 'Your rejected applications will appear here'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.light.themeColor }}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Loans</Text>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyForLoan}
        >
          <MaterialIcons name="add" size={20} color="white" />
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View
        style={[
          styles.content,
          {
            backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
          }
        ]}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['active', 'pending', 'rejected'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && {
                  borderBottomColor: isDarkMode ? Colors.dark.themeColorSecondary : Colors.light.themeColor,
                  borderBottomWidth: 2,
                }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab
                      ? (isDarkMode ? Colors.dark.themeColorSecondary : Colors.light.themeColor)
                      : (isDarkMode ? Colors.dark.text + '80' : Colors.light.text + '80'),
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                  }
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loans List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text
                style={[
                  styles.loadingText,
                  { color: isDarkMode ? Colors.dark.text : Colors.light.text }
                ]}
              >
                Loading loans...
              </Text>
            </View>
          ) : filteredLoans.length === 0 ? (
            renderEmptyState()
          ) : (
            filteredLoans.map(renderLoanCard)
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.themeColor,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loanCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
    overflow: 'hidden',
  },
  loanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  loanTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loanType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  loanCardBody: {
    padding: 20,
    paddingTop: 10,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  dateRow: {
    marginTop: 10,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  viewMoreContainer: {
    padding: 20,
    paddingTop: 0,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
  },
});

export default LoanPage;