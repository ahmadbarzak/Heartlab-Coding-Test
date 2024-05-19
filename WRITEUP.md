# HeartLab Coding Test - Writeup


## Instructions to Boot and Test the Solution
1. Ensure you have Node.js v16 or later installed.
2. Install necessary packages with `npm install`.
3. Run the test watcher using `npm run test`.

## Solution Design & Architecture

### Design Decisions
1. **Data Structure Choice**:
   - The parser organises the data by days of the week first, which significantly narrows down the number of clinics to check during a query. This design leverages the fact that the query is always for a specific date and time, allowing for efficient lookups.

2. **Handling Midnight Intervals**:
   - Clinics with opening hours that span past midnight (e.g., "11am to 2am") are handled by splitting the interval into two parts:
     - One interval from the start time to midnight of the same day.
     - Another interval from midnight to the closing time on the next day.
   - This ensures accurate querying for clinics open past midnight.

#### Key Design Elements
- **Luxon Library**: Utilised for date and time manipulation, simplifying operations like interval creation and date formatting.
- **Parsed Data Structure**:
  ```typescript
  type ParsedClinicOpeningHours = {
    [day: string]: {
      [clinicName: string]: Interval[];
    };
  };
  ```
  This structure maps each day of the week to clinics and their respective opening intervals.


### Technical Justification of Key Design Decisions
- **Day-First Structure**:
  - Prioritising days over clinics reduces the search space significantly during queries. For example, querying "Monday at 3pm" directly accesses the clinics open on Monday, bypassing clinics open on other days.

- **Interval Handling**:
  - Splitting intervals that span midnight into two ensures that the querying logic remains simple and accurate. This avoids the complexity of handling wrap-around times within a single interval.

### Scalability Considerations
- **Current Implementation**:
  - The current data structure is efficient for the provided dataset size. However, as the number of clinics grows, further optimisation may be needed.

- **Future Optimisation**:
  - **Bucketisation**: Distribute clinic intervals into hourly "buckets". For instance, "Clinic ABC" open from "Sat 9am-5pm" would appear in buckets 9, 10, 11, etc. This would reduce the number of intervals checked during a query, at the cost of increased parsing time and memory usage.
  - **Caching**: Implement caching for frequently queried date-time combinations. Cached results would speed up queries by avoiding redundant checks, faster than bucketisation at the cost of increased memory usage.

### Additional Thoughts
- **Edge Case Handling**:
  - The parser effectively handles edge cases like clinics open past midnight, ensuring accurate results even for early morning queries.
  - Multiple intervals per clinic per day are supported, allowing flexibility for various opening hour patterns.

- **Potential Enhancements**:
  - Extend the parser to handle multiple intervals with breaks within a single day.
  - Add validation to ensure non-overlapping intervals within a single day for the same clinic.
  - Add support for querying multiple times or intervals in a single query.

### Test Coverage and Edge Cases
- Added tests for critical edge cases, including:
  - Clinics open past midnight and their impact on querying the next day.
  - Clinics with multiple opening intervals within the same day.
- Perhaps additional tests may be needed if query criteria changes, such as querying for multiple days or intervals.

### Conclusion
This project was an excellent exercise in using TypeScript for practical problem-solving. The current implementation is efficient and accurate for the given dataset. Future scalability can be addressed with further optimisations like bucketisation and caching.

Thank you for the opportunity to work on this task. I look forward to any feedback you may have!