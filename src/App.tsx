import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false) // Bug 8: Employees are clickable before transactions are loaded
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false) // Bug 8: Employees are clickable before transactions are loaded

  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsTransactionsLoading(true) // Bug 8: Employees are clickable before transactions are loaded
    setIsEmployeesLoading(true) // Bug 8: Employees are clickable before transactions are loaded
    transactionsByEmployeeUtils.invalidateData()

    await employeeUtils.fetchAll()
    setIsEmployeesLoading(false) // Bug 5: Employees filter not available during loading more data

    await paginatedTransactionsUtils.fetchAll()
    setIsTransactionsLoading(false) // Bug 8: Employees are clickable before transactions are loaded
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      paginatedTransactionsUtils.invalidateData()

      transactionsByEmployeeUtils.fetchById(employeeId)
    },
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employeeUtils.loading, employees, loadAllTransactions])

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isEmployeesLoading}
          enabled={!isTransactionsLoading} // Bug 8: Employees are clickable before transactions are loaded
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }
            newValue.id ? await loadTransactionsByEmployee(newValue.id) : await loadAllTransactions() // Bug 3: Cannot select All Employees after selecting an employee
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {transactions !== null &&
            paginatedTransactions?.nextPage && ( // Bug 6: View more button not working as expected
              <button
                className="RampButton"
                disabled={paginatedTransactionsUtils.loading}
                onClick={async () => {
                  await loadAllTransactions()
                }}
              >
                View More
              </button>
            )}
        </div>
      </main>
    </Fragment>
  )
}
