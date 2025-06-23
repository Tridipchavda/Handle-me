export const journalStorage = {
    async getAllJournals() {
      try {
        const response = await fetch(`/api/journals`, {
          method: 'GET',
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch journals');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error getting journals:', error);
        throw error;
      }
    },
  
    async getJournalByDate(date: string) {
      try {
        const response = await fetch(`/api/journals?date=${date}`, {
          method: 'GET',
          credentials: 'include',
        });
  
        console.log(response,"----response")
        if (!response.ok) {
          throw new Error('Failed to fetch journal for given date');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error getting journal:', error);
        throw error;
      }
    },
  
    async upsertJournal(journal: {
      date: string;
      content: string;
      image?: string;
    }) {
      try {
        const existing = await this.getJournalByDate(journal.date);

        let method = 'POST';
        if (existing.message == "Journal not found") {
          method = 'POST';
        } else {
          method = 'PUT';
        }
  
        const response = await fetch('/api/journals', {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(journal), // ✅ FIXED: no duplication
        });
  
        if (!response.ok) {
          throw new Error(`Failed to ${method === 'POST' ? 'create' : 'update'} journal`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error in upsertJournal:', error);
        throw error;
      }
    },
  
    async deleteJournal(date: string) {
      try {
        const response = await fetch(`/api/journals?date=${date}`, {
          method: 'DELETE',
          credentials: 'include',
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete journal');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Error deleting journal:', error);
        throw error;
      }
    },
  };
  