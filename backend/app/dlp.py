"""Output-side DLP using Microsoft Presidio.

Detects sensitive data by its *shape* (entity type) rather than by knowing the
exact value in advance — the way real enterprise DLP works. Used to inspect the
model's response and redact anything that looks like a secret before it reaches
the user (layer two / egress filtering).
"""
from presidio_analyzer import AnalyzerEngine, PatternRecognizer, Pattern
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

# Entity types we scan for.
ENTITIES = [
    "CREDENTIAL",
    "CREDIT_CARD",
    "US_SSN",
    "EMAIL_ADDRESS",
    "PHONE_NUMBER",
    "IP_ADDRESS",
]

_analyzer = None
_anonymizer = None


def _build():
    """Lazily construct the Presidio engines (spaCy load is slow, do it once)."""
    global _analyzer, _anonymizer
    if _analyzer is not None:
        return

    nlp_config = {
        "nlp_engine_name": "spacy",
        "models": [{"lang_code": "en", "model_name": "en_core_web_sm"}],
    }
    nlp_engine = NlpEngineProvider(nlp_configuration=nlp_config).create_engine()
    analyzer = AnalyzerEngine(nlp_engine=nlp_engine)

    # Custom recognizer for credential-shaped tokens and API keys. This is what
    # catches the planted secret (e.g. SWORDFISH-9931) by pattern, not by value.
    credential = PatternRecognizer(
        supported_entity="CREDENTIAL",
        patterns=[
            Pattern(name="token", regex=r"\b[A-Z]{4,}-\d{3,}\b", score=0.85),
            Pattern(name="api_key", regex=r"\b(sk|pk|api)[-_][A-Za-z0-9]{16,}\b", score=0.8),
        ],
    )
    analyzer.registry.add_recognizer(credential)

    _analyzer = analyzer
    _anonymizer = AnonymizerEngine()


def analyze(text: str):
    """Return Presidio results (list of detected entities) for the text."""
    if not text:
        return []
    _build()
    return _analyzer.analyze(text=text, entities=ENTITIES, language="en")


def entity_types(results) -> list[str]:
    """Sorted, de-duplicated list of entity type names from results."""
    return sorted({r.entity_type for r in results})


def redact(text: str, results) -> str:
    """Replace each detected entity with a [REDACTED] token."""
    if not results:
        return text
    _build()
    out = _anonymizer.anonymize(
        text=text,
        analyzer_results=results,
        operators={"DEFAULT": OperatorConfig("replace", {"new_value": "[REDACTED]"})},
    )
    return out.text
