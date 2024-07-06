### Kubernetes Files

This directory contains the Kubernetes files used to deploy the project. We are using K3S as our Kubernetes distribution, and we are using SealedSecrets to store our secrets in the Git repository. Everything else is pretty standard with templates for deployments, services, and statefulsets, and our values which is the only file that should be modified directly.
