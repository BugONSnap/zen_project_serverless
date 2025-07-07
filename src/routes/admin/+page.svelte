<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    
    let activeTab = 'users';
    const tabs = [
        { id: 'users', label: 'Users' },
        { id: 'quizzes', label: 'Quizzes' },
        { id: 'categories', label: 'Categories' },
        { id: 'challengeTypes', label: 'Challenge Types' },
        { id: 'progress', label: 'User Progress' },
        { id: 'rankings', label: 'Rankings' },
        { id: 'results', label: 'Quiz Results' }
    ];

    function formatDate(timestamp: number | Date | null) {
        if (!timestamp) return 'N/A';
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleString();
    }
</script>

<div class="dashboard">
    <h1>Admin Dashboard</h1>
    
    <div class="tabs">
        {#each tabs as tab}
            <button 
                class="tab-button" 
                class:active={activeTab === tab.id}
                on:click={() => activeTab = tab.id}
            >
                {tab.label}
            </button>
        {/each}
    </div>

    <div class="table-container">
        {#if activeTab === 'users'}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Created At</th>
                        <th>Total Points</th>
                        <th>Rank ID</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.tables.users as user}
                        <tr>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>{user.totalPoints}</td>
                            <td>{user.rankId}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else if activeTab === 'quizzes'}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Points</th>
                        <th>Difficulty</th>
                        <th>Time Limit</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.tables.quizzes as quiz}
                        <tr>
                            <td>{quiz.id}</td>
                            <td>{quiz.title}</td>
                            <td>{quiz.quizCategoryId}</td>
                            <td>{quiz.points}</td>
                            <td>{quiz.difficulty}</td>
                            <td>{quiz.timeLimit}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else if activeTab === 'categories'}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.tables.categories as category}
                        <tr>
                            <td>{category.id}</td>
                            <td>{category.name}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else if activeTab === 'challengeTypes'}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Category ID</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.tables.challengeTypes as type}
                        <tr>
                            <td>{type.id}</td>
                            <td>{type.name}</td>
                            <td>{type.description}</td>
                            <td>{type.quizCategoryId}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else if activeTab === 'progress'}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Category ID</th>
                        <th>Total Quizzes</th>
                        <th>Completed</th>
                        <th>Completion %</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.tables.progress as progress}
                        <tr>
                            <td>{progress.id}</td>
                            <td>{progress.userId}</td>
                            <td>{progress.quizCategoryId}</td>
                            <td>{progress.totalQuizzes}</td>
                            <td>{progress.completedQuizzes}</td>
                            <td>{progress.completionPercentage}%</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else if activeTab === 'rankings'}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Rank Name</th>
                        <th>Min Points</th>
                        <th>Max Points</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.tables.rankings as rank}
                        <tr>
                            <td>{rank.id}</td>
                            <td>{rank.rankName}</td>
                            <td>{rank.minPoints}</td>
                            <td>{rank.maxPoints}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else if activeTab === 'results'}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Quiz ID</th>
                        <th>Attempt Date</th>
                        <th>Correct</th>
                        <th>Points Earned</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.tables.results as result}
                        <tr>
                            <td>{result.id}</td>
                            <td>{result.userId}</td>
                            <td>{result.quizId}</td>
                            <td>{formatDate(result.attemptDate)}</td>
                            <td>{result.isCorrect ? 'Yes' : 'No'}</td>
                            <td>{result.pointsEarned}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<style>
    .dashboard {
        max-width: 100%;
        margin: 0 auto;
        padding: 1rem;
    }

    h1 {
        margin-bottom: 2rem;
        color: #333;
    }

    .tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #ddd;
        padding-bottom: 0.5rem;
    }

    .tab-button {
        padding: 0.5rem 1rem;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 1rem;
        color: #666;
        border-radius: 4px;
        transition: all 0.2s;
    }

    .tab-button:hover {
        background-color: #f0f0f0;
    }

    .tab-button.active {
        background-color: #1a1a1a;
        color: white;
    }

    .table-container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
    }

    th, td {
        padding: 0.75rem 1rem;
        text-align: left;
        border-bottom: 1px solid #eee;
    }

    th {
        background-color: #f8f8f8;
        font-weight: 600;
        color: #333;
    }

    tr:hover {
        background-color: #f5f5f5;
    }

    td {
        color: #666;
    }
</style>