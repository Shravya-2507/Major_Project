import os

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_huggingface import HuggingFaceEmbeddings

from langchain_community.vectorstores import Chroma


BASE_DIR = os.path.dirname(os.path.dirname(__file__))

KB_PATH = os.path.join(BASE_DIR, "knowledge_base")

DB_PATH = os.path.join(BASE_DIR, "rag", "chroma", "db")


def ingest_documents():

    documents = []

    for root, dirs, files in os.walk(KB_PATH):

        for file in files:

            if file.lower().endswith(".pdf"):

                path = os.path.join(root, file)

                print(f"Reading: {path}")

                try:
                    loader = PyPDFLoader(path)
                    documents.extend(loader.load())

                except Exception as e:
                    print(f"❌ Failed: {path}")
                    print(e)

    print(f"\nLoaded {len(documents)} pages")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=150
    )

    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=DB_PATH
    )

    print("✅ Knowledge Base Indexed Successfully")

if __name__ == "__main__":

    ingest_documents()