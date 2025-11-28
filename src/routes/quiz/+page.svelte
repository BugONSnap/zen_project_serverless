<script lang="ts">
    import type { PageData } from './$types';
    import DashboardHeader from '$lib/DashboardHeader.svelte';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    export let data: PageData;

    let currentQuestionIndex = 0;
    let selectedAnswer: number | null = null;
    let score = 0;
    let quizCompleted = false;
    let quizData = data.quiz;
    let userCode = '';
    let userInput = '';
    let timer = 0;
    let timerInterval: any = null;
    let codeFeedback = '';
    let showIntroModal = true;
    let nextQuizId: number | null = null;
    let fontFamily = 'poppins';

    // Map category IDs to category names
    const categoryMap: { [key: string]: string } = {
        '1': 'HTML',
        '2': 'CSS',
        '3': 'JAVASCRIPT',
        '4': 'ADVANCE JAVASCRIPT'
    };

    $: categoryName = categoryMap[String(data.category)] || data.category;



    async function saveQuizResult(finalScore: number, isCorrect: boolean) {
        try {
            await fetch('/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: quizData.id,
                    score: finalScore,
                    isCorrect
                })
            });
        } catch (e) {
        }
    }

    function handleAnswer(optionIndex: number) {
        selectedAnswer = optionIndex;
    }

    async function saveProgress(statusOverride: string | null = null) {
    // Save quiz progress to main quizAttempts table
    try {
        await fetch('/api/quiz/attempt', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizId: quizData.id,
                currentStep: currentQuestionIndex,
                status: statusOverride || (quizCompleted ? 'COMPLETED' : 'IN_PROGRESS'),
                timeRemaining: timer
            })
        });
    } catch (e) { /* ignore */ }
}

    async function nextQuestion() {
        const currentQ = quizData.questions[currentQuestionIndex];
        if (quizData.challengeType === 'Identification') {
            // Compare userInput (trimmed, case-insensitive) to correctAnswer
            if (
                typeof currentQ.correctAnswer !== 'undefined' &&
                userInput.trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase()
            ) {
                score++;
            }
            quizCompleted = true;
            await saveProgress('COMPLETED');
            saveQuizResult(score, score > 0);
        } else if (
            quizData.challengeType === 'Complete the Code' || quizData.challengeType === 'Code Challenge'
        ) {
            const correct = currentQ.correctAnswer?.trim();
            if (userCode.trim() === correct) {
                score++;
                codeFeedback = 'Correct!';
            } else {
                codeFeedback = 'Incorrect. Try again or continue.';
            }
            quizCompleted = true;
            await saveProgress('COMPLETED');
            saveQuizResult(score, score > 0);
        } else {
            let isCorrect = false;
            if (typeof currentQ.correctAnswer !== 'undefined' && selectedAnswer !== null) {
                const options = quizData.questions[currentQuestionIndex].options;
                const correctNum = Number(currentQ.correctAnswer);

                // Numeric answer: support both 0-based and 1-based
                if (!isNaN(correctNum)) {
                    if (
                        selectedAnswer === correctNum || // zero-based
                        selectedAnswer === correctNum - 1 // one-based
                    ) {
                        isCorrect = true;
                    }
                } else if (
                    typeof currentQ.correctAnswer === 'string' &&
                    options
                ) {
                    isCorrect = options[selectedAnswer] === currentQ.correctAnswer;
                }
            }
            if (isCorrect) {
                score++;
            }
            if (currentQuestionIndex < quizData.questions.length - 1) {
                currentQuestionIndex++;
                saveProgress();
                selectedAnswer = null;
                userCode = '';
                userInput = '';
            } else {
                quizCompleted = true;
                await saveProgress('COMPLETED');
                stopTimer();
                saveQuizResult(score, score === quizData.questions.length);
            }
        }
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        selectedAnswer = null;
        score = 0;
        quizCompleted = false;
        userCode = '';
        userInput = '';
        codeFeedback = '';
        if (quizData.challengeType === 'Time Trial') {
            startTimer();
        }
    }

    function startTimer() {
        timer = quizData.questions?.[currentQuestionIndex]?.timeLimit || 60;
        stopTimer();
        timerInterval = setInterval(() => {
            timer--;
            if (timer <= 0) {
                stopTimer();
                nextQuestion();
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    $: if (quizData.challengeType === 'Time Trial' && !quizCompleted) {
        startTimer();
    }

    function closeIntroModal() {
        showIntroModal = false;
    }

    async function exitQuiz() {
        await saveProgress();
        // Go back or to a safe default route
        history.length > 1 ? history.back() : goto('/');
    }

    onMount(async () => {
        // Restore quiz progress from main quizAttempts table
        try {
            const res = await fetch(`/api/quiz/attempt?quizId=${quizData.id}`);
            if (res.ok) {
                const progress = await res.json();
                if (progress && typeof progress.currentStep === 'number') {
                    currentQuestionIndex = progress.currentStep;
                }
                if (progress && typeof progress.timeRemaining === 'number') {
                    timer = progress.timeRemaining;
                }
            }
        } catch (e) {
            // ignore if not logged in or error
        }

        // Try to get all quizzes for this category and difficulty from the server-rendered data (if available)
        // If not, fetch them from the API (not implemented here, but you can add it if needed)
        // For now, we assume the quizzes are ordered by id and consecutive
        // This logic assumes you have access to all quizzes for the category/difficulty on the client
        // If not, you may need to fetch them from the server
        if (data.allQuizzes) {
            const quizzes = data.allQuizzes.filter(q => q.difficulty === quizData.difficulty && q.quizCategoryId === data.category);
            quizzes.sort((a, b) => a.id - b.id);
            const currentIndex = quizzes.findIndex(q => q.id === quizData.id);
            if (currentIndex !== -1 && currentIndex < quizzes.length - 1) {
                nextQuizId = quizzes[currentIndex + 1].id;
            } else {
                nextQuizId = null;
            }

        }
    });

    function goToNextQuiz() {
        if (nextQuizId) {
            window.location.href = `/quiz?category=${encodeURIComponent(data.category ?? '')}&difficulty=${encodeURIComponent(quizData.difficulty ?? '')}&id=${nextQuizId}`;
        }
    }
</script>

<div class="min-h-screen text-white font-medium relative dashboard-bg" style="background: linear-gradient(135deg, #0f172a 0%, #1a1f2e 50%, #111827 100%); overflow: visible;">
    <!-- Animated gradient overlay -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 50%, #d97706 0%, transparent 50%), radial-gradient(circle at 80% 80%, #1e40af 0%, transparent 50%); mix-blend-mode: screen;"></div>
    <!-- Subtle dot pattern -->
    <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#d97706 1px, transparent 1px); background-size: 50px 50px;"></div>
    <DashboardHeader title={quizData.title} user={data.user} quizCategory={categoryName} />
    {#if showIntroModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
            <div class="relative w-full max-w-lg rounded-2xl border border-white/15 bg-black/70 p-8 text-white shadow-2xl">
                <button class="absolute top-3 right-3 text-white/60 hover:text-white text-2xl font-bold focus:outline-none" on:click={closeIntroModal} aria-label="Close">&times;</button>
                <p class="text-xs uppercase tracking-[0.35em] text-white/60">Ready?</p>
                <h2 class="mt-2 text-3xl font-semibold">{quizData.title}</h2>
                <p class="mt-4 text-white/80">{quizData.description}</p>
                <button class="mt-6 w-full rounded-full border border-emerald-400/70 px-6 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/10 transition" on:click={closeIntroModal}>
                    Start Quiz
                </button>
            </div>
        </div>
    {/if}
    {#if !showIntroModal}
        <div class="max-w-3xl mx-auto px-4 py-10">
            <div class="rounded-3xl border border-white/15 bg-[#090303]/70 p-6 shadow-2xl backdrop-blur">
                <!-- Quiz Title Section -->
                <div class="mb-6">
                    <h1 class="text-3xl font-bold text-white">{quizData.title}</h1>
                </div>
                {#if quizData.questions && quizData.questions.length > 0}
                    {#if !quizCompleted}
                        <div class="mb-6">
                            <div class="flex justify-between items-center text-white/80 text-sm">
                                <span>Question {currentQuestionIndex + 1} of {quizData.questions.length}</span>
                                {#if quizData.challengeType === 'Time Trial'}
                                    <span class="text-red-300 font-semibold">Time left: {timer}s</span>
                                {/if}
                            </div>
                            <div class="mt-2 w-full bg-white/10 rounded-full h-2.5">
                                <div class="h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style="width: {((currentQuestionIndex + 1) / quizData.questions.length) * 100}%"></div>
                            </div>
                        </div>
                        {#if quizData.challengeType === 'Multiple Choice'}
                            <div class="mb-6">
                                <h2 class="text-xl font-semibold text-white mb-4">
                                    {quizData.questions[currentQuestionIndex].question}
                                </h2>
                                <div class="space-y-3">
                                    {#each quizData.questions[currentQuestionIndex].options as option, index}
                                        <button
                                            class={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                                                selectedAnswer === index
                                                    ? 'border-emerald-400 bg-emerald-400/10 text-white'
                                                    : 'border-white/15 bg-white/5 text-white/80 hover:border-white/30'
                                            }`}
                                            on:click={() => handleAnswer(index)}
                                        >
                                            {option}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        {:else if quizData.challengeType === 'Code Challenge' || quizData.challengeType === 'Complete the Code'}
                            <div class="mb-8">
                                <h2 class="text-xl font-semibold text-white mb-4">
                                    {quizData.questions[currentQuestionIndex].question}
                                </h2>
                                <div class="mb-4 rounded-2xl border border-white/15 bg-black/40 p-4 shadow-inner">
                                    <div class="mb-2">
                                        <label class="block text-sm uppercase tracking-[0.3em] text-white/60">Starter Code</label>
                                    </div>
                                    <pre class="min-h-[120px] whitespace-pre-wrap rounded-xl border border-white/15 bg-black/60 p-3 font-mono text-sm text-emerald-200 select-all">{quizData.questions[currentQuestionIndex].starterCode}</pre>
                                </div>
                                <div class="mb-2 rounded-2xl border border-white/15 bg-[#090303]/70 p-4">
                                    <label class="block text-sm uppercase tracking-[0.3em] text-white/60 mb-2">Your Answer</label>
                                    <textarea class="w-full rounded-xl border border-white/15 bg-black/40 p-3 font-mono text-sm text-white focus:ring-2 focus:ring-emerald-400 outline-none" rows="7" bind:value={userCode} placeholder="Write or complete the code here..."></textarea>
                                </div>
                                {#if codeFeedback}
                                    <div class="mt-2 text-emerald-300">{codeFeedback}</div>
                                {/if}
                                <div class="flex justify-end mt-4">
                                    <button class="rounded-full border border-emerald-400/70 px-6 py-2 text-sm text-emerald-100 hover:bg-emerald-400/10 transition" on:click={nextQuestion}>
                                        Submit Code
                                    </button>
                                </div>
                            </div>
                        {:else if quizData.challengeType === 'Identification'}
                            <div class="mb-6">
                                <h2 class="text-xl font-semibold text-white mb-4">
                                    {quizData.questions[currentQuestionIndex].question}
                                </h2>
                                <input class="w-full rounded-2xl border border-white/15 bg-[#090303]/70 px-4 py-3 text-white focus:ring-2 focus:ring-emerald-400 outline-none" type="text" bind:value={userInput} placeholder="Type your answer here..." />
                                <div class="flex justify-end mt-4">
                                    <button class="rounded-full border border-emerald-400/70 px-6 py-2 text-sm text-emerald-100 hover:bg-emerald-400/10 transition" on:click={nextQuestion}>
                                        Submit Answer
                                    </button>
                                </div>
                            </div>
                        {:else if quizData.challengeType === 'Time Trial'}
                            <div class="mb-6">
                                <h2 class="text-xl font-semibold text-white mb-4">
                                    {quizData.questions[currentQuestionIndex].question}
                                </h2>
                                <div class="space-y-3">
                                    {#each quizData.questions[currentQuestionIndex].options as option, index}
                                        <button
                                            class={`w-full text-left rounded-2xl border px-4 py-3 transition ${
                                                selectedAnswer === index
                                                    ? 'border-emerald-400 bg-emerald-400/10 text-white'
                                                    : 'border-white/15 bg-white/5 text-white/80 hover:border-white/30'
                                            }`}
                                            on:click={() => handleAnswer(index)}
                                        >
                                            {option}
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        {:else}
                            <div class="text-center py-8 text-white/60">
                                Unsupported challenge type.
                            </div>
                        {/if}
                        <div class="flex justify-end gap-3">
                            <button
                                class="rounded-full border border-white/20 px-6 py-2 text-sm text-white/80 hover:border-white/40"
                                on:click={() => saveProgress('IN_PROGRESS')}
                                type="button"
                            >
                                Save Progress
                            </button>
                            <button
                                class="rounded-full border border-emerald-400/70 px-6 py-2 text-sm text-emerald-100 hover:bg-emerald-400/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                                on:click={nextQuestion}
                                disabled={quizData.challengeType === 'Multiple Choice' && selectedAnswer === null}
                            >
                                {currentQuestionIndex === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        </div>
                    {:else}
                        <div class="text-center py-8">
                            <h2 class="text-3xl font-semibold text-white mb-4">Quiz Completed!</h2>
                            <p class="text-xl text-white/80 mb-6">
                                Your score: {score} out of {quizData.questions.length}
                            </p>
                            {#if quizData.explanation}
                                <div class="mb-6 text-white/80">
                                    <span class="block text-lg font-semibold">Explanation:</span>
                                    <p class="text-md">{quizData.explanation}</p>
                                </div>
                            {/if}
                            <button
                                class="rounded-full border border-white/20 px-6 py-2 text-sm text-white hover:border-white/40"
                                on:click={restartQuiz}
                            >
                                Restart Quiz
                            </button>
                            {#if nextQuizId}
                                <button
                                    class="ml-4 rounded-full border border-emerald-400/70 px-6 py-2 text-sm text-emerald-100 hover:bg-emerald-400/10 transition"
                                    on:click={goToNextQuiz}
                                >
                                    Continue to Next Quiz
                                </button>
                            {/if}
                        </div>
                    {/if}
                {:else}
                    <div class="text-center py-8 text-white/60">
                        No questions available for this quiz.
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>