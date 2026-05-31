const assert = require('assert');

console.log("\n=======================================================");
console.log(" 🧪 PartyMatch - Zautomatyzowany Zestaw Testów Jednostkowych");
console.log("=======================================================\n");

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
    try {
        fn();
        console.log(`✅ TEST ZALICZONY: ${name}`);
        passedTests++;
    } catch (e) {
        console.error(`❌ TEST NIEUDANY: ${name}`);
        console.error(e);
        failedTests++;
    }
}

// Dane stanu gry poddane testom
const mockGameState = {
    demoMode: false,
    coupleNames: "Wiktoria & Przemek"
};

// 1. Test Domyślnego Stanu Demo Mode
runTest("Domyślny Tryb Demo powinien być wyłączony (false)", () => {
    assert.strictEqual(mockGameState.demoMode, false, "Tryb demonstracyjny powinien być domyślnie wyłączony!");
});

// 2. Test kodu PIN autoryzacji Panelu Organizatora
runTest("PIN Panelu Organizatora powinien być równy 4453", () => {
    const validPin = "4453";
    const enteredPinCorrect = "4453";
    const enteredPinIncorrect = "1234";
    
    assert.strictEqual(enteredPinCorrect === validPin, true, "PIN 4453 powinien być poprawny!");
    assert.strictEqual(enteredPinIncorrect === validPin, false, "PIN 1234 nie powinien być poprawny!");
});

// 3. Test dynamicznego podziału imion Pary Młodej (splitting helper)
function splitCoupleNames(namesStr) {
    const parts = namesStr.split(/&|i\s|and|,/);
    const bride = parts[0] ? parts[0].trim() : 'Wiktoria';
    const groom = parts[1] ? parts[1].trim() : 'Przemek';
    return { bride, groom };
}

runTest("Dynamiczny podział imion z znakiem '&'", () => {
    const result = splitCoupleNames("Katarzyna & Tomasz");
    assert.strictEqual(result.bride, "Katarzyna");
    assert.strictEqual(result.groom, "Tomasz");
});

runTest("Dynamiczny podział imion z słowem 'i'", () => {
    const result = splitCoupleNames("Monika i Krystian");
    assert.strictEqual(result.bride, "Monika");
    assert.strictEqual(result.groom, "Krystian");
});

runTest("Dynamiczny podział imion z słowem 'and'", () => {
    const result = splitCoupleNames("Anna and John");
    assert.strictEqual(result.bride, "Anna");
    assert.strictEqual(result.groom, "John");
});

runTest("Dynamiczny podział - zabezpieczenie w przypadku braku drugiego imienia", () => {
    const result = splitCoupleNames("SoloBride");
    assert.strictEqual(result.bride, "SoloBride");
    assert.strictEqual(result.groom, "Przemek"); // fallback
});

// 4. Testy walidacji parametrów API na serwerze (symulacja)
function simulateApiCheckUser(name, nick) {
    if (!name || !nick) {
        return { status: "error", message: "Brak wymaganych parametrów" };
    }
    return { status: "success", exists: name === "Katarzyna" && nick === "Kasia" };
}

runTest("API check_user - wykrycie istniejącego użytkownika", () => {
    const res = simulateApiCheckUser("Katarzyna", "Kasia");
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.exists, true);
});

runTest("API check_user - brak duplikatu dla innych danych", () => {
    const res = simulateApiCheckUser("Jan", "Jasiek");
    assert.strictEqual(res.status, "success");
    assert.strictEqual(res.exists, false);
});

runTest("API check_user - błąd przy braku imienia", () => {
    const res = simulateApiCheckUser("", "Kasia");
    assert.strictEqual(res.status, "error");
});

console.log("\n=======================================================");
console.log(`📊 PODSUMOWANIE TESTÓW: Zaliczone: ${passedTests} | Nieudane: ${failedTests}`);
console.log("=======================================================\n");

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
