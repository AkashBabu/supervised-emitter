# Benchmark report for Supervised-Emitter 


Name            |  Avg (ms)     |   Min (ms)      |   Max (ms)
:---------------|:--------------|:----------------|:-------------
pub_same_topic  |  48.68  |  19.29  |  104.74  
pub_different_topics  |  33.89  |  20.27  |  96.88  
pub_normal_subscribers_same_topic  |  24.27  |  17.65  |  44.39  
pub_normal_subscribers_different_topics  |  64.32  |  39.14  |  213.41  
pub_same_topic_single_glob_subscriber  |  21.29  |  18.59  |  25.97  
pub_different_topic_single_glob_subscriber  |  45.91  |  20.09  |  196.00  
pub_glob_subscribers_different_topics  |  1650.00  |  1221.03  |  2467.31  
gsub_same_topic  |  18.84  |  9.72  |  32.90  
gsub_different_topics  |  25.89  |  20.69  |  36.77  
sub_same_topic  |  21.05  |  11.00  |  39.54  
sub_different_topics  |  27.11  |  21.61  |  41.77  
gunsub_same_topic  |  20.09  |  9.09  |  40.39  
gunsub_different_topics  |  27.69  |  17.32  |  37.06  
chained_gunsub_same_topics  |  21.28  |  15.73  |  29.86  
chained_gunsub_different_topics  |  32.37  |  25.88  |  39.50  
unsub_same_topic  |  21.46  |  7.08  |  38.74  
unsub_different_topics  |  28.53  |  22.60  |  41.16  
chained_unsub_same_topic  |  24.45  |  16.50  |  38.24  
chained_unsub_different_topics  |  18.28  |  11.36  |  29.07  


