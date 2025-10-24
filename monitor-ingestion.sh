#!/bin/bash

# Monitor ingestion progress
echo "Monitoring data ingestion progress..."
echo "Press Ctrl+C to stop monitoring (ingestion will continue)"
echo ""

while true; do
    clear
    echo "=========================================="
    echo "    INGESTION PROGRESS MONITOR"
    echo "=========================================="
    echo ""
    
    # Check if process is still running
    if ps aux | grep -v grep | grep "node ingest-data.js" > /dev/null; then
        echo "Status: RUNNING ✓"
        echo ""
        echo "Latest progress:"
        tail -10 ingest.log
    else
        echo "Status: COMPLETED ✓"
        echo ""
        echo "Final output:"
        tail -20 ingest.log
        echo ""
        echo "=========================================="
        break
    fi
    
    sleep 5
done

echo "Ingestion monitoring complete!"
